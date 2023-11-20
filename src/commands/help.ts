import { APIEmbedField, Message, SlashCommandBuilder } from 'discord.js';
import { Bot } from '../models/bot';
import { EmbedMessage } from '../Tools/EmbedMessage';
import { Command } from '../models/command';

module.exports = {
  name: 'help',
  description: 'List all of my commands or info about a specific command.',
  usage: '/help',
  slashCommand: {
    data: new SlashCommandBuilder()
      .setName('help')
      .setDescription('List all of my commands or info about a specific command.'),
  },
  admin: false,
  alias: ['aide'],

  async execute(client: Bot, message: Message, args: string[]) {
    const commands: APIEmbedField[] = [];
    client.commands.forEach((command: Command) => {
      if (!command.admin) {
        // let desc = command.alias != undefined && command.alias.length > 0
        //   ? "Alias : " + command.alias.join(", ") + "\n" + command.description
        //   : command.description;
        commands.push({ name: command.usage, value: command.description });
      }
    });
    const embed = EmbedMessage(client, 'Liste des commandes', 'Voici la liste des commandes disponibles :', commands);
    return embed;
  },
};
