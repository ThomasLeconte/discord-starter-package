import { Interaction, Message, MessageActionRow, Modal, ModalActionRowComponent, TextInputComponent } from "discord.js";
import { ModalComponentTypes } from "discord.js/typings/enums";
import { Bot, EventType } from "../Bot";
import EmbedMessage from "../Tools/EmbedMessage";
import { MessageFormatter } from "../Tools/MessageFormatter";
import ModalBuilder from "../Tools/ModalBuilder";

module.exports = {
  name: 'ping',
  description: 'Check bot status',
  usage: '/ping',
  slashCommand: {
    enabled: false,
    options: []
  },
  admin: false,

  async execute(client: Bot, message: Message, args: string[]) {
    const modal = new ModalBuilder("Mon compte - Connexion", "my_modal")
    .addTextInput("Coucou", "my_text_input", true).addTextInput("Bonsoir", "my_paragraph", false)
    message.channel.send(new MessageFormatter().addEmbedMessage(
      EmbedMessage.showSuccess(client, "Test", "desc")
    ).addButton("MODAL TEST", "🤡", "PRIMARY", "my_button").format());
    client.setNewEvent(EventType.BUTTON_EVENT, "my_button", (interaction: Interaction) => {
      if(interaction.isButton()){
        interaction.showModal(modal);
      }
      return;
    });
    client.setNewEvent(EventType.MODAL_SUBMIT_EVENT, modal.getCustomId(), (interaction: Interaction) => {
      if(interaction.isModalSubmit()){
        // console.log(interaction.fields.getTextInputValue())
      }
      return;
    });
    return `${new Date().toLocaleString()} - :ping_pong: Pong !`;
  }
}