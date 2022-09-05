import { Bot, Command, SlashCommandConfig } from "../Bot";
import * as fs from "fs";
import { ApplicationCommandType } from "discord.js";

export class CommandsRegister {
  static async registerCommands(bot: Bot) {
    if(fs.existsSync("./commands")){
      const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.ts'))
      const commandsInitialized = []
      for (const file of commandFiles) {
        const command: Command = new Command(require(`../commands/${file}`));
        bot.commands.set(command.name.toLowerCase(), command);
        if (bot.config.slashCommands || (command.slashCommand as unknown as SlashCommandConfig).enabled) {
          CommandsRegister.registerSlashCommand(bot, command);
        }
        commandsInitialized.push({ name: command.name, slash: (command.slashCommand as unknown as SlashCommandConfig).enabled })
      }
      console.log("\x1b[36m", "# - - - - COMMANDS - - - - #")
      console.log(`# Slash commands : ${commandsInitialized.filter(c => c.slash).map(c => bot.config.prefix + c.name).join(", ")}`)
      console.log(`# Basic commands : ${commandsInitialized.filter(c => !c.slash).map(c => bot.config.prefix + c.name).join(", ")}`)
      console.log("# - - - - COMMANDS - - - - #\n", "\x1b[0m")
    }else{
      throw new Error("./commands folder not found ! Please create it and put your commands files inside it.")
    }
  }

  static registerSlashCommand(bot: Bot, command: Command){
    bot.guilds.cache.forEach(guild => {
      bot.application.commands.create({
        name: command.name,
        description: command.description,
        options: (command.slashCommand as any).options,
        type: ApplicationCommandType.ChatInput
      }, guild.id);
    });
  }
}