import { APIEmbedField, EmbedBuilder } from 'discord.js';
import { Bot } from '../Bot';

/**
 *
 * @param client Your bot instance
 * @param title Title of embed
 * @param desc Description inside embed
 * @returns
 */
function ErrorEmbed(client: Bot, title: string, desc: string) {
  const footer: any = { text: '© ' + client.user?.username };
  footer.iconURL = client.user?.avatarURL();
  return new EmbedBuilder().setTitle(title).setDescription(desc).setColor(0xe74c3c).setFooter(footer);
}

/**
 *
 * @param client Your bot instance
 * @param title Title of embed
 * @param desc Description inside embed
 * @returns
 */
function SuccessEmbed(client: Bot, title: string, desc: string) {
  const footer: any = { text: '© ' + client.user?.username };
  footer.iconURL = client.user?.avatarURL();
  return new EmbedBuilder().setTitle(title).setDescription(desc).setColor(0x2ecc71).setFooter(footer);
}

/**
 *
 * @param client Your bot instance
 * @param title Title of embed
 * @param desc Description inside embed
 * @param fields Optional - Fields inside embed
 * @returns
 */
function EmbedMessage(client: Bot, title?: string, desc?: string, fields?: APIEmbedField[]) {
  const footer: any = { text: '© ' + client.user?.username };
  footer.iconURL = client.user?.avatarURL();
  const result = new EmbedBuilder()
    .setColor(0xabc9c)
    .setThumbnail(client.user!!.displayAvatarURL())
    // .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
    .setTimestamp()
    .setFooter(footer);
  if (title) result.setTitle(title);
  if (desc) result.setDescription(desc);
  if (fields) result.setFields(fields);
  return result;
}

export { ErrorEmbed, SuccessEmbed, EmbedMessage };

// constructor(client: Bot, args: EmbedProperties) {
//   // this.client = client;
//   // if (args != null) {
//   //   // if (args.title !== undefined) {
//   //   //   this.title = args.title;
//   //   // }
//   //   if (args.titleLink !== undefined) {
//   //     this.url = args.titleLink;
//   //   }
//   //   if (args.description !== undefined) {
//   //     this.description = args.description;
//   //   }
//   //   if (args.content !== undefined) {
//   //     // args.content.forEach((line: any) => {
//   //     //   this.fields.push({name: line.name, value: line.content});
//   //     // });
//   //     this.fields.push({name: '\u200B', value: '\u200B'})
//   //   }
//   //   // if (args.thumbnail !== undefined && args.thumbnail != false) {
//   //   //   this.thumbnail = {url: this.client.user.displayAvatarURL()}
//   //   // }
//   //   if (args.color !== undefined) {
//   //     this.color = args.color
//   //   } else {
//   //     this.color = 0xabc9c
//   //   }
//   //   // if (args.image !== undefined) {
//   //   //   this.image = {url: args.image}
//   //   // }
//   // } else {
//   //   this.title = "⛔ Error";
//   //   this.description = "An error has occurred during Embed Message generation. Please contact bot administrator.";
//   // }
//   // this.footer = { text: this.client.user.username, icon_url: this.client.user.displayAvatarURL() }
// }
