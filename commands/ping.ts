import { Message } from "discord.js";
import { Bot } from "../Bot";

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
    client.getWebHook("tata").send("Hi")
    return `${new Date().toLocaleString()} - :ping_pong: Pong !`;
  }
}