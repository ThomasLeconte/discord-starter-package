import { ActionRowBuilder, APIEmbed, ButtonBuilder, ButtonStyle, EmbedBuilder, SelectMenuBuilder } from "discord.js";

export type SelectOption = {label: string, description: string, value: string};
export class MessageFormatter {
  private embeds: EmbedBuilder[];
  private content: string;
  private components: ActionRowBuilder;
  private files: string[];

  constructor(){
    this.components = new ActionRowBuilder();
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

  addEmbedMessage(embed: EmbedBuilder): this {
    this.embeds.push(embed);
    return this;
  }

  addButton(label: string, emoji: string, style: ButtonStyle, customId: string, disabled: boolean = false, url: string | null = null): this {
    const button = new ButtonBuilder()
      .setLabel(label)
      .setEmoji(emoji)
      .setStyle(style)
      .setCustomId(customId)
      .setDisabled(disabled);
    if(url) button.setURL(url)
    this.components.addComponents(button);
    return this;
  }

  addSelectMenu(options: SelectOption[], customId: string, placeholder: string | null = null): this {
    const button = new SelectMenuBuilder()
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