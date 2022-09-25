import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export default class ModalConstructor extends ModalBuilder {
  constructor(title: string, customId: string) {
    super();
    this.setTitle(title);
    this.setCustomId(customId);
  }

  /**
   *
   * @param options : {label: string, custom_id: string}
   * @param textarea Show a textarea instead of a text input
   * @returns
   */
  addTextInput(options: { label: string; custom_id: string }, textarea: boolean) {
    const textInput = new TextInputBuilder(options).setStyle(
      textarea ? TextInputStyle.Paragraph : TextInputStyle.Short,
    );
    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
    this.addComponents(row);
    return this;
  }
}
