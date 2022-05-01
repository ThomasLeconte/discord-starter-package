import { MessageActionRow, MessageButton, MessageButtonStyle, MessageEmbed, MessageSelectMenu } from "discord.js";

export type SelectOption = {label: string, description: string, value: string};
export class MessageFormatter {
  private embeds: MessageEmbed[];
  private content: string;
  private components: MessageActionRow;
  private files: string[];

  constructor(){
    this.components = new MessageActionRow();
    this.embeds = [];
    this.files = [];
  }

  addContent(content: string){
    this.content += content
    return this;
  }

  setContent(content: string){
    this.content = content;
    return this;
  }

  addEmbedMessage(embed: MessageEmbed): this {
    this.embeds.push(embed);
    return this;
  }

  addButton(label: string, emoji: string, style: MessageButtonStyle, customId: string, disabled: boolean = false): this {
    this.components.addComponents(new MessageButton()
      .setLabel(label)
      .setEmoji(emoji)
      .setStyle(style)
      .setCustomId(customId)
      .setDisabled(disabled));
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

  addFile(path: string) {
    this.files.push(path)
    return this;
  }

  format(): any {
    let finalResult: any = {}
    if (this.embeds.length > 0) finalResult.embeds = this.embeds;
    if (this.components.components.length > 0) finalResult.components = [this.components];
    if (this.content != undefined) finalResult.content = this.content;
    if (this.files.length > 0) finalResult.files = this.files;
    return finalResult;
  }
}