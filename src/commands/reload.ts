import { Message } from 'discord.js';
import { Bot } from '../models/bot';
import { CommandsRegister } from '../Tools/CommandsRegister';
import { ErrorEmbed } from '../Tools/EmbedMessage';

module.exports = {
  name: 'reload',
  description: 'Reload one or all commands',
  usage: '/reload',
  admin: true,

  async execute(client: Bot, message: Message, args: string[]) {
    const commandName = args[0]?.toLowerCase() ?? 'all';

    try {
      return CommandsRegister.reloadCommand(client, commandName);
    } catch (err) {
      return ErrorEmbed(
        client,
        `Error during command reload`,
        `**${commandName}** cannot be reloaded. Error code : ${err}`,
      );
    }
  },
};
