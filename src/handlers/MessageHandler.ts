import { EmbedBuilder, Interaction } from 'discord.js';
import { Bot } from '../models/bot';
import { ErrorEmbed } from '../Tools/EmbedMessage';
import { EmbedPaginator } from '../Tools/EmbedPaginator';
import { MessageFormatter } from '../Tools/MessageFormatter';
import { PaginationChangeHandler } from './PaginationChangeHandler';

export class MessageHandler {
  private bot: Bot;
  private paginationHandler: PaginationChangeHandler;
  private interactionsEvent: Map<string, (interaction: Interaction) => void>;

  constructor(bot: Bot) {
    this.bot = bot;
    this.interactionsEvent = new Map<string, (interaction: Interaction) => void>();
    this.paginationHandler = new PaginationChangeHandler(this.bot);
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
        if (!this.bot.commands.has(commandName)) {
          this.bot.sendMessage(
            msg,
            ErrorEmbed(this.bot, `**${this.bot.name()} - Error**`, `The command "${commandName}" does not exist.`),
          );
        } else {
          const command = this.bot.commands.get(commandName);
          if (!command) {
            console.error(`Command ${commandName} not found !`);
            return;
          }

          if (command.admin && !msg.member?.roles.cache.find((role) => role.name === this.bot.config.adminRole)) {
            this.bot.sendMessage(
              msg,
              ErrorEmbed(
                this.bot,
                `**${this.bot.name()} - Error**`,
                `You don't have the permission to execute this admin command.`,
              ),
            );
            return;
          }

          if (
            command.roles &&
            command.roles.length > 0 &&
            command.roles.find((role) => !msg.member?.roles.cache.find((r) => r.name === role))
          ) {
            this.bot.sendMessage(
              msg,
              ErrorEmbed(
                this.bot,
                `**${this.bot.name()} - Error**`,
                `You don't have sufficient permissions to execute this command.`,
              ),
            );
            return;
          }

          Promise.resolve((command as any).execute(this.bot, msg, args))
            .then((result: string | EmbedBuilder | MessageFormatter | EmbedPaginator) => {
              if (result) {
                const isPrivateResult = command.private !== undefined && command.private === true;
                if (isPrivateResult) {
                  msg.author.send(this.formatResponseByType(result)).then((message) => {
                    if (result instanceof EmbedPaginator) {
                      this.paginationHandler.handleMessageChanges(message, msg.author, result, isPrivateResult);
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
                            this.paginationHandler.handleMessageChanges(message, msg.author, result, isPrivateResult);
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
      default:
        return null;
    }
  }
}
