import { Interaction } from "discord.js";
import { Bot } from "../Bot";
import EmbedMessage from "./EmbedMessage";
import { MessageFormatter } from "./MessageFormatter";

export class InteractionHandler {
  bot: Bot;
  interactionsEvent: Map<String, (interaction: Interaction) => void>;
  contextMenuEvent: Map<String, (interaction: Interaction) => void>;

  constructor(bot: Bot) {
    this.bot = bot;
    this.interactionsEvent = this.contextMenuEvent = new Map<String, (interaction: Interaction) => void>();
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

  listen(){
    this.bot.on('interactionCreate', async interaction => {
      if (interaction.isApplicationCommand() && !interaction.isUserContextMenu()) {
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
      } else if (interaction.isUserContextMenu()) {
        if(this.contextMenuEvent.has(interaction.commandName)){
          this.contextMenuEvent.get(interaction.commandName)(interaction);
        }        
      }
    });
  }
}