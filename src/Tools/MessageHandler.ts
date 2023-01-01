import { EmbedBuilder, Interaction } from 'discord.js';
import { Bot } from '../Bot';
import { ErrorEmbed } from './EmbedMessage';
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
            .then((result: string | EmbedBuilder | MessageFormatter) => {
              if (result) {
                if (command.private !== undefined && command.private === true) {
                  msg.author.send(this.formatResponseByType(result));
                } else {
                  this.bot.sendMessage(msg, result);
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
