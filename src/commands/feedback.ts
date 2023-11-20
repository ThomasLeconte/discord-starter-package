import { Interaction, InteractionType, Message, SlashCommandBuilder } from 'discord.js';
import { Bot } from '../models/bot';
import ModalConstructor from '../Tools/ModalConstructor';
import { EventType } from '../enums';

module.exports = {
  name: 'feedback',
  description: 'Give feedback of the bot',
  usage: '/feedback',
  slashCommand: {
    data: new SlashCommandBuilder().setName('feedback').setDescription('Give feedback of the bot'),
  },
  admin: false,

  async execute(client: Bot, message: Message, args: string[]) {
    const feedbackKey = 'feedback_modal';
    const modal = new ModalConstructor("What's your opinion ?", feedbackKey).addTextInput(
      { label: 'Your feedback', custom_id: 'feedback_input' },
      true,
    );

    client.setNewEvent(EventType.MODAL_SUBMIT_EVENT, feedbackKey, (interaction: Interaction) => {
      if (interaction.type === InteractionType.ModalSubmit) {
        console.log('A feedback has been submitted: ' + interaction.fields.getTextInputValue('feedback_input'));
        interaction.reply({ content: 'Thank you for your feedback!', ephemeral: true });
      }
    });

    return modal;
  },
};
