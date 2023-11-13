import { Message, SlashCommandBuilder } from "discord.js";
import { Bot, Command } from "../Bot";
import { ErrorEmbed } from "../Tools/EmbedMessage";

module.exports = {
    name: 'reload',
    description: 'Reload one or all commands',
    usage: '/reload',
    slashCommand: {
      data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reload one or all commands')
        .addStringOption(option => option.setName("name").setDescription("Command's name you want to reload").setRequired(false)),
      private: true  
    },
    admin: true,
  
    async execute(client: Bot, message: Message, args: string[]) {
      const commandName = args[0].toLowerCase() ?? 'all';


      const reload = (command: Command) => {
        delete require.cache[require.resolve(command.filePath)];

        client.commands.delete(command.name.toLowerCase());
        client.commands.set(command.name.toLowerCase(), command);
      }


      if(commandName === 'all') {
        //circular forEach ==> temp clone
        const _commands = Object.assign({}, client.commands)

        _commands.forEach((command) => {
          reload(command)
        })
      } else {
        if(client.commands.has(commandName)){
          const command = client.commands.get(commandName);
          if(command) {
            reload(command)
          } else {
            return ErrorEmbed(client, `Error during command reload`, `**${args[0]}** cannot be reloaded. Error code : NOT_FOUND_IN_COMMANDS_MAP`)
          }   
        } else {
          return ErrorEmbed(client, `Command does not exists`, `**${args[0]}** command not found in client registered commands`);
        }
      }
    },
};