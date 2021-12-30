import { Interaction, Message } from "discord.js";
import { Bot, EventType } from "../Bot";
import EmbedMessage from "../Tools/EmbedMessage";
import { MessageFormatter } from "../Tools/MessageFormatter";

// DO NOT DELETE THIS COMMAND !
module.exports = {
  name: 'disablecommand',
  description: 'Disable a command',
  usage: '/disablecommand <command>',
  slashCommand: {
    enabled: true,
    // To learn more about options field, please visit :
    // https://discord.com/developers/docs/interactions/application-commands#registering-a-command
    options: [
      {
        name: "command",
        description: "Command name to disable",
        type: 3,
        required: true
      }
    ]
  },
  admin: true,

  async execute(client: Bot, message: Message, args: any[]) {
    if (args[0]) {
      if (message.member.roles.cache.find(r => r.name == client.config.adminRole)) {
        if(client.commands.has(args[0])){
          if (client.disabledCommands.has(args[0])) {
            client.disabledCommands.delete(args[0]);
            const result = new MessageFormatter();
            result.addEmbedMessage(EmbedMessage.showSuccess(client, `**Disable - Success**`, `The command "${args[0]}" has been enabled !`));
            return result;
          } else {
            client.disabledCommands.set(args[0], true);
            return EmbedMessage.showSuccess(client, `**Disable - Success**`, `The command "${args[0]}" has been disabled !`);
          }
        }else{
          return EmbedMessage.showError(client, "**Disable - Error**", `Command "${args[0]}" doesn't exist.`);
        }
      } else {
        return EmbedMessage.showError(client, `**Disable - Error**`, `You don't have the permission to use this command !`);
      }
    }else{
      return EmbedMessage.showError(client, "**Disable - Error**", "You must specify a command name to disable.");
    }
  }
}