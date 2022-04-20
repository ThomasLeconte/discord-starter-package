import { Interaction } from "discord.js";
import { Bot } from "../Bot";
import EmbedMessage from "./EmbedMessage";
import { MessageFormatter } from "./MessageFormatter";

export class MessageHandler {
  private bot: Bot;
  private interactionsEvent: Map<String, (interaction: Interaction) => void>;

  constructor(bot: Bot) {
    this.bot = bot;
    this.interactionsEvent = new Map<String, (interaction: Interaction) => void>();
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
      if (!msg.content.startsWith(this.bot.config.prefix)) return;

      const args = msg.content.slice(this.bot.config.prefix.length).split(' ');
      const command = args.shift().toLocaleLowerCase();

      if (this.bot.disabledCommands.has(command)) {
        this.bot.sendMessage(msg, EmbedMessage.showError(this.bot, `**${this.bot.name()} - Error**`, `The command "${command}" is disabled !`));
      } else {
        if (this.bot.commands.has(command)) {
          await this.bot.commands.get(command).execute(this.bot, msg, args).then((result: string | EmbedMessage | MessageFormatter) => {
            if (result) this.bot.sendMessage(msg, result);
            if(this.bot.config.autoLog) this.bot.log(`${this.bot.commands.get(command).name} command executed by ${msg.author.username} with following args: [${args.join(', ')}]`);
          }).catch((err: Error) => {
            console.error(`An error has occured : ${err.message}`)
            this.bot.sendMessage(msg, EmbedMessage.showError(this.bot, `**${this.bot.name()} - Error**`, "An error has occured with this command. Please try again later ..."))
          });
        } else {
          this.bot.sendMessage(msg, EmbedMessage.showError(this.bot, `**${this.bot.name()} - Error**`, `The command "${command}" does not exist.`));
        }
      }
    });
  }
}
