import { Interaction } from "discord.js";
import { Bot } from "../Bot";
import EmbedMessage from "./EmbedMessage";
import { MessageFormatter } from "./MessageFormatter";

export class MessageHandler {
  bot: Bot;
  interactionsEvent: Map<String, (interaction: Interaction) => void>;

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

  listen(){
    this.bot.on('messageCreate', async (msg) => {
      if (msg.author.bot) return;
      if (!msg.content.startsWith(this.bot.config.prefix)) return;

      const args = msg.content.slice(this.bot.config.prefix.length).split(' ');
      const command = args.shift().toLocaleLowerCase();

      if (this.bot.disabledCommands.has(command)) {
        this.bot.sendMessage(msg, EmbedMessage.showError(this.bot, `**${this.bot.name()} - Error**`, `The command "${command}" is disabled !`));
      } else {
        if (this.bot.commands.has(command)) {
          await this.bot.commands.get(command).execute(this, msg, args).then((result: string | EmbedMessage) => {
            if (result) this.bot.sendMessage(msg, result);
          });
        } else {
          this.bot.sendMessage(msg, EmbedMessage.showError(this.bot, `**${this.bot.name()} - Error**`, `The command "${command}" does not exist.`));
        }
      }
    })

    this.bot.on('interactionCreate', async interaction => {
      if (interaction.isApplicationCommand()) {
        const args = (interaction.options as any)._hoistedOptions
        const channel = this.bot.channels.cache.find(c => c.id == interaction.channelId)
        const guild = this.bot.guilds.cache.get(interaction.guildId)
        let message = null
        await guild.members.fetch().then(members => {
          let member = members.get(interaction.member.user.id)
          if (args != undefined && args.find((a: any) => a.type == "USER") != null) {
            const mention_id = args.find((arg: any) => arg.type == "USER").value
            message = {
              guild: guild,
              channel: channel,
              member: member,
              author: member.user,
              mention: members.get(mention_id).user,
              interaction
            }
          } else {
            message = { guild: guild, channel: channel, member: member, author: member.user, interaction }
          }
        }).catch(err => console.error(err));

        const newArgs = args != undefined ? args.map((el: any) => el.value) : []
        await this.bot.commands.get(interaction.command.name.toLocaleLowerCase()).execute(this.bot, message, newArgs).then((result: string | EmbedMessage | MessageFormatter) => {
          if (result) {
            if (result instanceof EmbedMessage) {
              interaction.reply({ embeds: [result] });
            } else if (result instanceof MessageFormatter) {
              interaction.reply(result.format());
            } else {
              interaction.reply(result);
            }
          }
          return;
        });
      } else if (interaction.isButton() || interaction.isSelectMenu()) {
        if (this.interactionsEvent.has(interaction.customId)) {
          this.interactionsEvent.get(interaction.customId)(interaction);
        }
      }
    })
  }
}