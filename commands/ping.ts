import { Message } from "discord.js";
import { Bot } from "../Bot";
import { MessageFormatter } from "../Tools/MessageFormatter";

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
    message.channel.send(new MessageFormatter().setContent("coucou").addFile("test.docx").format())
    return `${new Date().toLocaleString()} - :ping_pong: Pong !`;
  }
}