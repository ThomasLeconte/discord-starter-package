import { EmbedBuilder, Interaction, InteractionType, ModalBuilder } from 'discord.js';
import { Bot } from '../Bot';
import { ErrorEmbed } from './EmbedMessage';
import { MessageFormatter } from './MessageFormatter';

export class InteractionHandler {
  private bot: Bot;
  private interactionsEvent: Map<string, (interaction: Interaction) => void>;
  private contextMenuEvent: Map<string, (interaction: Interaction) => void>;

  constructor(bot: Bot) {
    this.bot = bot;
    this.interactionsEvent = this.contextMenuEvent = new Map<string, (interaction: Interaction) => void>();
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
    this.bot.on('interactionCreate', async (interaction) => {
      if (interaction.isChatInputCommand() && !interaction.isUserContextMenuCommand()) {
        if (!interaction.command) return;
        if (!interaction.guildId) return;

        const command: string = this.bot.commands.get(interaction.command.name);
        if (this.bot.disabledCommands.has(command)) {
          interaction.reply({
            embeds: [ErrorEmbed(this.bot, `**${this.bot.name()} - Error**`, `The command "${command}" is disabled !`)],
          });
          return;
        }

        const args = (interaction.options as any)._hoistedOptions;
        const channel = this.bot.channels.cache.find((c) => c.id === interaction.channelId);
        const guild = this.bot.guilds.cache.get(interaction.guildId);
        if (!guild) return;
        let message: any = null;
        await guild.members
          .fetch()
          .then((members) => {
            const member = members.get(interaction.user.id);
            if (args !== undefined && args.find((a: any) => a.type === 'USER')) {
              const mentionId = args.find((arg: any) => arg.type === 'USER').value;
              message = {
                guild: guild,
                channel: channel,
                member: member,
                author: member?.user,
                mention: members.get(mentionId)?.user,
                interaction,
              };
            } else {
              message = { guild: guild, channel: channel, member: member, author: member?.user, interaction };
            }
          })
          .catch((err) => console.error(err));

        const newArgs = args !== undefined ? args.map((el: any) => el.value) : [];
        await this.bot.commands
          .get(interaction.command.name.toLocaleLowerCase())
          .execute(this.bot, message, newArgs)
          .then((result: string | EmbedBuilder | MessageFormatter | ModalBuilder) => {
            if (result) {
              if (typeof result === 'string') {
                interaction.reply(result);
              } else {
                switch (result.constructor.name) {
                  case 'EmbedBuilder':
                    interaction.reply({ embeds: [result as EmbedBuilder] });
                    break;
                  case 'MessageFormatter':
                    interaction.reply((result as MessageFormatter).format());
                    break;
                  case 'ModalConstructor':
                    interaction.showModal(result as ModalBuilder);
                    break;
                }
              }
              if (!(result.constructor.name === 'ModalConstructor')) {
                if (this.bot.config.autoLog)
                  this.bot.log(
                    `${command} command executed by ${message.author.username} with following args: [${newArgs.join(
                      ', ',
                    )}]`,
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
        interaction.isSelectMenu() ||
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
}
