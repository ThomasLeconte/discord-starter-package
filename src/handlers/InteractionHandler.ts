import {
  EmbedBuilder,
  GuildMemberRoleManager,
  Interaction,
  InteractionReplyOptions,
  InteractionType,
  ModalBuilder,
  Role,
} from 'discord.js';
import { Bot } from '../models/bot';
import { ErrorEmbed } from '../Tools/EmbedMessage';
import { EmbedPaginator } from '../Tools/EmbedPaginator';
import { MessageFormatter } from '../Tools/MessageFormatter';
import { PaginationChangeHandler } from './PaginationChangeHandler';

export class InteractionHandler {
  private bot: Bot;
  private paginationHandler: PaginationChangeHandler;
  private interactionsEvent: Map<string, (interaction: Interaction) => void>;
  private contextMenuEvent: Map<string, (interaction: Interaction) => void>;

  constructor(bot: Bot) {
    this.bot = bot;
    this.interactionsEvent = this.contextMenuEvent = new Map<string, (interaction: Interaction) => void>();
    this.paginationHandler = new PaginationChangeHandler(this.bot);
  }

  /**
   *
   * @param buttonCustomId custom ID provided on button creation
   * @param callback function to execute when button with this custom ID is clicked
   */
  newButtonEvent(buttonCustomId: string, callback: (interaction: Interaction) => void) {
    this.interactionsEvent.set(buttonCustomId, (interaction) => callback(interaction));
  }

  /**
   *
   * @param selectMenuCustomId custom ID provided on select menu creation
   * @param callback function to execute when select menu with this custom ID is clicked
   */
  newSelectMenuEvent(selectMenuCustomId: string, callback: (interaction: Interaction) => void) {
    this.interactionsEvent.set(selectMenuCustomId, (interaction) => callback(interaction));
  }

  /**
   *
   * @param contextMenuName name of the context menu
   * @param callback function to execute when context menu is clicked
   */
  newContextMenuEvent(contextMenuName: string, callback: (interaction: Interaction) => void) {
    this.contextMenuEvent.set(contextMenuName, (interaction) => callback(interaction));
  }

  newModalEvent(modalCustomId: string, callback: (interaction: Interaction) => void) {
    this.interactionsEvent.set(modalCustomId, (interaction) => callback(interaction));
  }

  listen() {
    this.bot.on('interactionCreate', async (interaction: Interaction) => {
      if (!interaction) return;
      if (interaction.isChatInputCommand() && !interaction.isUserContextMenuCommand()) {
        if (!interaction.guildId) return;

        const command = this.bot.commands.get(interaction.commandName);

        if (!command) {
          console.error(`Command ${interaction.commandName} not found !`);
          return;
        }

        if (!command.slashCommand) {
          console.error(`Command ${interaction.commandName} is not a slash command !`);
          return;
        }

        if (this.bot.disabledCommands.has(command.name)) {
          interaction.reply({
            embeds: [ErrorEmbed(this.bot, `**${this.bot.name()} - Error**`, `The command "${command}" is disabled !`)],
          });
          return;
        }

        const isPrivateResult = command.private !== undefined && command.private === true;

        const args = (interaction.options as any)._hoistedOptions;

        if (
          command.admin &&
          !(interaction.member?.roles as GuildMemberRoleManager).cache.find(
            (role: Role) => role.name === this.bot.config.adminRole,
          )
        ) {
          interaction.reply({
            embeds: [
              ErrorEmbed(
                this.bot,
                `**${this.bot.name()} - Error**`,
                `You don't have the permission to execute this admin command.`,
              ),
            ],
            ephemeral: true,
          });
          return;
        }

        if (
          command.roles &&
          command.roles.length > 0 &&
          command.roles.find(
            (role) => !(interaction.member?.roles as GuildMemberRoleManager).cache.find((r: Role) => r.name === role),
          )
        ) {
          interaction.reply({
            embeds: [
              ErrorEmbed(
                this.bot,
                `**${this.bot.name()} - Error**`,
                `You don't have sufficient permissions to execute this command.`,
              ),
            ],
            ephemeral: true,
          });
          return;
        }

        const newArgs = args !== undefined ? args.map((el: any) => el.value) : [];
        Promise.resolve((command as any).execute(this.bot, interaction, newArgs))
          .then(async (result: string | EmbedBuilder | MessageFormatter | ModalBuilder | EmbedPaginator) => {
            if (result) {
              let finalResult = null;
              switch (result.constructor.name) {
                case 'EmbedPaginator':
                  if (result instanceof EmbedPaginator) {
                    interaction
                      .reply({ ...result.getResult(), ephemeral: isPrivateResult })
                      .then((interactionResult) => {
                        this.paginationHandler.handleInteractionChanges(
                          interactionResult,
                          result as EmbedPaginator,
                          isPrivateResult,
                        );
                      });
                  }
                  break;
                case 'String':
                case 'EmbedBuilder':
                case 'MessageFormatter':
                case 'Object':
                  finalResult = this.formatResponseByType(result);
                  interaction.reply({ ...finalResult, ephemeral: isPrivateResult });
                  break;
                case 'ModalConstructor':
                case 'ModalBuilder':
                  interaction.showModal(result as ModalBuilder);
                  break;
              }
              if (!(result.constructor.name === 'ModalConstructor' || result.constructor.name === 'ModalBuilder')) {
                if (this.bot.config.autoLog)
                  this.bot.log(
                    `${interaction.command?.name} command executed by ${interaction.member?.user.username}
                     with following args: [${args.map((a: any) => '{' + a.name + ': ' + a.value + '}').join(', ')}]`,
                  );
              }
            }
            return;
          })
          .catch((err: Error) => {
            console.error(`An error has occured : ${err.message}\n${err.stack}`);
            interaction.reply({
              embeds: [
                ErrorEmbed(
                  this.bot,
                  `**${this.bot.name()} - Error**`,
                  'An error has occured with this command. Please try again later ...',
                ),
              ],
            });
          });
      } else if (
        interaction.isButton() ||
        interaction.isAnySelectMenu() ||
        interaction.type === InteractionType.ModalSubmit
      ) {
        if (this.interactionsEvent.has(interaction.customId)) {
          this.interactionsEvent.get(interaction.customId)?.(interaction);
        }
      } else if (interaction.isUserContextMenuCommand()) {
        if (this.contextMenuEvent.has(interaction.commandName)) {
          this.contextMenuEvent.get(interaction.commandName)?.(interaction);
        }
      }
    });
  }

  formatResponseByType(response: any) {
    switch (response.constructor.name) {
      case 'String':
        return { content: response as string };
      case 'EmbedBuilder':
        return { embeds: [response as EmbedBuilder] };
      case 'MessageFormatter':
        return (response as MessageFormatter).format();
      case 'Object':
        if (this.canBeCastedToInteractionReply(response)) {
          return response as InteractionReplyOptions;
        } else {
          throw new Error(
            "Can't cast object to InteractionReplyOptions type. Please refer to official discord developer documentation.",
          );
        }
    }
  }

  canBeCastedToInteractionReply(object: any): boolean {
    return (
      object.hasOwnProperty('content') ||
      object.hasOwnProperty('embeds') ||
      object.hasOwnProperty('files') ||
      object.hasOwnProperty('components')
    );
  }
}
