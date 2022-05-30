import { Message } from "discord.js";
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
      .addTextInput({ label: "Your feedback", customId: "feedback_input" }, true);

    client.setNewEvent(EventType.MODAL_SUBMIT_EVENT, feedbackKey, (interaction) => {
      if(interaction.isModalSubmit()){
        console.log("A feedback was submitted: " + interaction.fields.getField("feedback_input").value);
        interaction.reply("Thank you for your feedback!");
      }
    });

    return modal;
  }
}