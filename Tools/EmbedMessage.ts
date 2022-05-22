import { ColorResolvable, MessageEmbed } from 'discord.js';
import { Bot } from '../Bot'

export type EmbedProperties = {
  title?: string, titleLink?: string, description?: string, content?: EmbedContent[],
  thumbnail?: boolean, color?: ColorResolvable, image?: string, author?: string
}
export type EmbedContent = { name: string, content: string }

export default class EmbedMessage extends MessageEmbed {
  private client: Bot
  constructor(client: Bot, args: EmbedProperties) {
    super();
    this.client = client;
    if (args != null) {
      if (args.title !== undefined) {
        this.setTitle(args.title);
      }
      if (args.titleLink !== undefined) {
        this.setURL(args.titleLink);
      }
      if (args.description !== undefined) {
        this.setDescription(args.description);
      }
      if (args.content !== undefined) {
        args.content.forEach((line: any) => {
          this.addField(line.name, line.content);
        });
        this.addField('\u200B', '\u200B')
      }
      if (args.thumbnail !== undefined && args.thumbnail != false) {
        this.setThumbnail(this.client.user.displayAvatarURL());
      }
      if (args.color !== undefined) {
        this.setColor(args.color);
      } else {
        this.setColor("#1abc9c");
      }
      if (args.image !== undefined) {
        this.setImage(args.image);
      }
    } else {
      this.setTitle("⛔ Error");
      this.setDescription("An error has occurred during Embed Message generation. Please contact bot administrator.");
    }

    this.setTimestamp();
    this.setFooter({text: this.client.user.username, iconURL: this.client.user.displayAvatarURL()});
  }

  static showError(client: Bot, title: string, desc: string) {
    return new EmbedMessage(client, {
      title: title,
      description: desc,
      color: "#e74c3c"
    });
  }

  static showSuccess(client: Bot, title: string, desc: string) {
    return new EmbedMessage(client, {
      title: title,
      description: desc,
      color: "#2ecc71"
    })
  }
}