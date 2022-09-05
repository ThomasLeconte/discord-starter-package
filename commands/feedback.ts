import { InteractionType, Message } from "discord.js";
import { Bot, EventType } from "../Bot";
import ModalBuilder from "../Tools/ModalBuilder";

module.exports = {
  name: 'feedback',
  description: 'Give feedback of the bot',
  usage: '/feedback',
  slashCommand: {
    enabled: true,
    options: []
  },
  admin: false,

  async execute(client: Bot, message: Message, args: string[]) {

    const feedbackKey = "feedback_modal";
    const modal = new ModalBuilder("What's your opinion ?", feedbackKey)
      .addTextInput({ label: "Your feedback", custom_id: "feedback_input" }, true);

    client.setNewEvent(EventType.MODAL_SUBMIT_EVENT, feedbackKey, (interaction) => {
      if(interaction.type == InteractionType.ModalSubmit){
        console.log("A feedback has been submitted: " + interaction.fields.getTextInputValue("feedback_input"));
        interaction.reply("Thank you for your feedback!");
      }
    });

    return modal;
  }
}