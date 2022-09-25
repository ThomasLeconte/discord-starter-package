import { Message } from 'discord.js';
import { Bot } from '../Bot';

module.exports = {
  name: 'ping',
  description: 'Check bot status',
  usage: '/ping',
  slashCommand: {
    enabled: false,
    options: [],
  },
  admin: false,

  async execute(client: Bot, message: Message, args: string[]) {
    // const content: APIEmbedField[] = []
    // for (let i = 0; i < 30; i++) {
    //   content.push({ name: "name-" + i, value: "value-" + i })
    // }
    // // EmbedPaginator(client, message, content to show in embed, embed options, paginator options)
    // new EmbedPaginator(client, message, content, { title: "Items" }, { itemsPerPage: 10, nextLabel: "Next page", previousLabel: "Previous page" })
    return `${new Date().toLocaleString()} - :ping_pong: Pong !`;
  },
};
