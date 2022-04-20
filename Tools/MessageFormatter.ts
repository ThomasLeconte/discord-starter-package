import { MessageActionRow, MessageButton, MessageButtonStyle, MessageEmbed, MessageSelectMenu } from "discord.js";

export type SelectOption = {label: string, description: string, value: string};
export class MessageFormatter {
  private embeds: any[];
  private content: string;
  private components: MessageActionRow;

  constructor(){
    this.components = new MessageActionRow();
    this.embeds = [];
  }

  setContent(content: string){
    this.content = content;
    return this;
  }

  addEmbedMessage(embed: MessageEmbed): this {
    this.embeds.push(embed);
    return this;
  }

  addButton(label: string, emoji: string, style: MessageButtonStyle, customId: string): this {
    this.components.addComponents(new MessageButton()
      .setLabel(label)
      .setEmoji(emoji)
      .setStyle(style)
      .setCustomId(customId));
    return this;
  }

  addSelectMenu(options: SelectOption[], customId: string, placeholder: string = null): this {
    const button = new MessageSelectMenu()
      .setOptions(options)
      .setCustomId(customId);
    if(placeholder) button.setPlaceholder(placeholder) 
    this.components.addComponents(
      button
    );
    return this;
  }

  format(): any {
    let finalResult: any = {}
    if (this.embeds.length > 0) finalResult.embeds = this.embeds;
    if (this.components.components.length > 0) finalResult.components = [this.components];
    if (this.content != undefined) finalResult.content = this.content;
    return finalResult;
  }
}