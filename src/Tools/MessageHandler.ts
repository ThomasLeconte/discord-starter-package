import { ButtonStyle, ComponentType, EmbedBuilder, Interaction, Message, User } from 'discord.js';
import { Bot } from '../Bot';
import { EmbedMessage, ErrorEmbed } from './EmbedMessage';
import { EmbedPaginator } from './EmbedPaginator';
import { MessageFormatter } from './MessageFormatter';

export class MessageHandler {
  private bot: Bot;
  private interactionsEvent: Map<string, (interaction: Interaction) => void>;

  constructor(bot: Bot) {
    this.bot = bot;
    this.interactionsEvent = new Map<string, (interaction: Interaction) => void>();
  }

  newButtonEvent(buttonCustomId: string, callback: (interaction: Interaction) => void) {
    this.interactionsEvent.set(buttonCustomId, (interaction) => callback(interaction));
  }

  newSelectMenuEvent(selectMenuCustomId: string, callback: (interaction: Interaction) => void) {
    this.interactionsEvent.set(selectMenuCustomId, (interaction) => callback(interaction));
  }

  listen() {
    this.bot.on('messageCreate', async (msg) => {
      if (msg.author.bot) return;
      if (!msg.content.startsWith(this.bot.config.prefix!)) return;

      const args = msg.content.slice(this.bot.config.prefix!.length).split(' ');
      if (args.length === 0) return;
      const commandName = args.shift()!!.toLocaleLowerCase();

      if (this.bot.disabledCommands.has(commandName)) {
        this.bot.sendMessage(
          msg,
          ErrorEmbed(this.bot, `**${this.bot.name()} - Error**`, `The command "${commandName}" is disabled !`),
        );
      } else {
        if (this.bot.commands.has(commandName)) {
          const command = this.bot.commands.get(commandName);
          if (!command) {
            console.error(`Command ${commandName} not found !`);
            return;
          }
          await (command as any)
            .execute(this.bot, msg, args)
            .then((result: string | EmbedBuilder | MessageFormatter | EmbedPaginator) => {
              if (result) {
                const isPrivateResult = command.private !== undefined && command.private === true;
                if (isPrivateResult) {
                  msg.author.send(this.formatResponseByType(result)).then((message) => {
                    if (result instanceof EmbedPaginator) {
                      this.handlePaginationChanges(message, msg.author, result, isPrivateResult);
                    }
                  });
                } else {
                  if (typeof result === 'string') {
                    msg.channel.send(result);
                  } else {
                    switch (result.constructor.name) {
                      case 'EmbedBuilder':
                        msg.channel.send({ embeds: [result as EmbedBuilder] });
                        break;
                      case 'MessageFormatter':
                        msg.channel.send((result as MessageFormatter).format());
                        break;
                      case 'EmbedPaginator':
                        if (result instanceof EmbedPaginator) {
                          msg.channel.send(result.getResult() as any).then((message) => {
                            this.handlePaginationChanges(message, msg.author, result, isPrivateResult);
                          });
                        }
                        break;
                    }
                  }
                }

                if (this.bot.config.autoLog)
                  this.bot.log(
                    `${commandName} command executed by ${msg.author.username} with following args: [${args.join(
                      ', ',
                    )}]`,
                  );
              }
            })
            .catch((err: Error) => {
              console.error(`An error has occured : ${err.message}\n${err.stack}`);
              this.bot.sendMessage(
                msg,
                ErrorEmbed(
                  this.bot,
                  `**${this.bot.name()} - Error**`,
                  'An error has occured with this command. Please try again later ...',
                ),
              );
            });
        } else {
          this.bot.sendMessage(
            msg,
            ErrorEmbed(this.bot, `**${this.bot.name()} - Error**`, `The command "${commandName}" does not exist.`),
          );
        }
      }
    });
  }
  handlePaginationChanges(message: Message, author: User, result: EmbedPaginator, isPrivateResult: boolean) {
    const collector = message.createMessageComponentCollector({
      time: 9999999,
      componentType: ComponentType.Button,
    });
    collector.on('collect', (interactionResult) => {
      console.log(interactionResult);
      if (interactionResult.user.id === author.id) {
        if (interactionResult.customId === result.getIDs().previousID) result.setPage(result.getPage() - 1);
        if (interactionResult.customId === result.getIDs().nextID) result.setPage(result.getPage() + 1);

        const startIndex =
          result.getPage() === 1 ? 0 : result.getPage() * result.getItemsPerPage() - result.getItemsPerPage();
        const endIndex = result.getPage() * result.getItemsPerPage();

        const chunk = result.getContent().slice(startIndex, endIndex);
        // console.log(page, startIndex, endIndex)

        if (interactionResult.customId === result.getIDs().previousID) {
          interactionResult.update(
            new MessageFormatter()
              .addEmbedMessage(
                EmbedMessage(this.bot, result.getEmbedTitle(), result.getEmbedOptions().description, chunk),
              )
              .addButton(
                result.getPreviousLabel(),
                result.getPreviousIcon(),
                ButtonStyle.Primary,
                result.getIDs().previousID,
                result.getPage() === 1,
              )
              .addButton(result.getNextLabel(), result.getNextIcon(), ButtonStyle.Primary, result.getIDs().nextID)
              .format(),
          );
        } else if (interactionResult.customId === result.getIDs().nextID) {
          interactionResult.update(
            new MessageFormatter()
              .addEmbedMessage(
                EmbedMessage(this.bot, result.getEmbedTitle(), result.getEmbedOptions().description, chunk),
              )
              .addButton(
                result.getPreviousLabel(),
                result.getPreviousIcon(),
                ButtonStyle.Primary,
                result.getIDs().previousID,
              )
              .addButton(
                result.getNextLabel(),
                result.getNextIcon(),
                ButtonStyle.Primary,
                result.getIDs().nextID,
                endIndex >= result.getContent().length,
              )
              .format(),
          );
        }
      }
      return;
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
      default:
        return null;
    }
  }
}
