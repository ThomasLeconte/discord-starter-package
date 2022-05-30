import { Modal, TextInputComponent, TextInputStyleResolvable, MessageActionRow, ModalActionRowComponent, TextInputComponentOptions } from "discord.js";

export default class Builder extends Modal {

  constructor(title: string, customId: string) {
    super();
    this.setTitle(title);
    this.setCustomId(customId);
  }

  addTextInput(options: TextInputComponentOptions, textarea: boolean) {
    const textInput = new TextInputComponent(options).setStyle(textarea ? "PARAGRAPH" : "SHORT");
    const row = new MessageActionRow<ModalActionRowComponent>().addComponents(textInput);
    this.addComponents(row);
    return this;
  }

  getCustomId(): string {
    return this.customId;
  }
}