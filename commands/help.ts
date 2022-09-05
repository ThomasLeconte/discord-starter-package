import { APIEmbedField, EmbedBuilder, Message } from "discord.js";
import { Bot } from "../Bot";
import { EmbedMessage } from "../Tools/EmbedMessage";

module.exports = {
  name: 'help',
  description: 'List all of my commands or info about a specific command.',
  usage: '/help [command name]',
  slashCommand: {
    enabled: true,
    options: []
  },
  admin: false,
  alias: ['aide'],

  async execute(client: Bot, message: Message, args: string[]){
    let commands: APIEmbedField[] = [];
    client.commands.forEach(command => {
      if (!command.admin) {
        let desc = command.alias != undefined && command.alias.length > 0
          ? "Alias : " + command.alias.join(", ") + "\n" + command.description
          : command.description;
        commands.push({ name: command.usage, value: desc });
      }
    });
    return EmbedMessage(client, "Help", "List of all commands", commands);
  }
}