import { Message } from "discord.js";
import { Bot } from "../Bot";
import EmbedMessage, { EmbedContent } from "../Tools/EmbedMessage";
import EmbedPaginator from "../Tools/EmbedPaginator";
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
    // Concider you're on a command file ...
    const content: EmbedContent[] = []
    for (let i = 0; i < 30; i++) {
      content.push({ name: "name-" + i, content: "value-" + i })
    }

    // EmbedPaginator(client, message, content to show in embed, embed options, paginator options)
    new EmbedPaginator(client, message, content, { title: "Items" }, { itemsPerPage: 10, nextLabel: "Next page", previousLabel: "Previous page" })
    //return `${new Date().toLocaleString()} - :ping_pong: Pong !`;
  }
}