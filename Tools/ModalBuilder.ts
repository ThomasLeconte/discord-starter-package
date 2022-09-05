import { ActionRowBuilder, APITextInputComponent, ModalActionRowComponent, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default class Builder extends ModalBuilder {

  constructor(title: string, customId: string) {
    super();
    this.setTitle(title);
    this.setCustomId(customId);
  }

  addTextInput(options: {label: string, custom_id: string}, textarea: boolean) {
    const textInput = new TextInputBuilder(options).setStyle(textarea ? TextInputStyle.Paragraph : TextInputStyle.Short);
    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
    this.addComponents(row);
    return this;
  }
}