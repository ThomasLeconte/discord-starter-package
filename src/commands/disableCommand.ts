import { GuildMemberRoleManager, Interaction, Message, SlashCommandBuilder } from 'discord.js';
import { Bot } from '../models/bot';
import { ErrorEmbed, SuccessEmbed } from '../Tools/EmbedMessage';
import { MessageFormatter } from '../Tools/MessageFormatter';

// DO NOT DELETE THIS COMMAND !
module.exports = {
  name: 'disablecommand',
  description: 'Disable a command',
  usage: '/disablecommand <command>',
  private: true,
  slashCommand: {
    data: new SlashCommandBuilder()
      .setName('disablecommand')
      .setDescription('Disable a command')
      .addStringOption((option) =>
        option.setName('command').setDescription('Command name to disable').setRequired(true),
      ),
    private: true,
  },
  admin: true,

  async execute(client: Bot, message: Interaction, args: any[]) {
    if (args[0]) {
      if ((message.member?.roles as GuildMemberRoleManager).cache.find((r) => r.name === client.config.adminRole)) {
        if (client.commands.has(args[0])) {
          if (client.disabledCommands.has(args[0])) {
            client.disabledCommands.delete(args[0]);
            const result = new MessageFormatter();
            result.addEmbedMessage(
              SuccessEmbed(client, `**Disable - Success**`, `The command "${args[0]}" has been enabled !`),
            );
            return result;
          } else {
            client.disabledCommands.set(args[0], true);
            return SuccessEmbed(client, `**Disable - Success**`, `The command "${args[0]}" has been disabled !`);
          }
        } else {
          return ErrorEmbed(client, '**Disable - Error**', `Command "${args[0]}" doesn't exist.`);
        }
      } else {
        return ErrorEmbed(client, `**Disable - Error**`, `You don't have the permission to use this command !`);
      }
    } else {
      return ErrorEmbed(client, '**Disable - Error**', 'You must specify a command name to disable.');
    }
  },
};
