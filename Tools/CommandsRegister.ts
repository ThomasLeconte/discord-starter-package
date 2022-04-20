import { Bot, Command, SlashCommandConfig } from "../Bot";
import * as fs from "fs";

export class CommandsRegister {
  static registerCommands(bot: Bot) {
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.ts'))
    for (const file of commandFiles) {
      const command: Command = new Command(require(`../commands/${file}`));
      bot.commands.set(command.name.toLowerCase(), command);
      if(bot.config.slashCommands || (command.slashCommand as unknown as SlashCommandConfig).enabled){
        CommandsRegister.registerSlashCommand(bot, command);
      }
    }
  }

  static registerSlashCommand(bot: Bot, command: Command){
    bot.guilds.cache.forEach(guild => {
      bot.application.commands.create({
        name: command.name,
        description: command.description,
        options: (command.slashCommand as any).options,
        type: "CHAT_INPUT",
        defaultPermission: true
      }, guild.id).then(() => {
        console.log(`# "${command.name}" slash command registered in "${guild.name}" guild.`);
      });
    });
  }
}