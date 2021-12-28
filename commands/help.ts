import { Message } from "discord.js";
import { Bot } from "../Bot";
import EmbedMessage from "../Tools/EmbedMessage";

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
    let commands: any[] = [];
    client.commands.forEach(command => {
      if (!command.admin) {
        let desc = ''
        if (command.alias != undefined && command.alias.length > 0) {
          desc = "Alias : " + command.alias.join(", ") + "\n" + command.description
        } else {
          desc = command.description
        }
        commands.push({ name: command.usage, content: desc });
      }
    });
    return new EmbedMessage(client, {
      title: "**Help :**",
      content: commands,
      thumbnail: true,
      author: message.author.username,
    })
  }
}