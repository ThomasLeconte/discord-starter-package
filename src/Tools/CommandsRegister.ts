import { Bot, Command } from '../Bot';
import * as fs from 'fs';
import * as path from 'path';
import { ApplicationCommandType } from 'discord.js';

export class CommandsRegister {
  static async registerCommands(bot: Bot) {
    const commandsPath = `${require.main?.path}/commands`;
    const defaultCommandsPath = path.join(__dirname, '../commands');

    if (fs.existsSync(commandsPath)) {
      const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));
      const defaultCommandFiles = fs.readdirSync(defaultCommandsPath).filter((file) => file.endsWith('.js'));
      const commandsInitialized = [];

      for (const file of defaultCommandFiles) {
        if (bot.config.defaultCommandsDisabled!.includes(file.replace('.js', ''))) continue;
        const command: Command = new Command(require(`${defaultCommandsPath}/${file}`));
        bot.commands.set(command.name.toLowerCase(), command);
        if (command.slashCommand?.enabled) {
          this.registerSlashCommand(bot, command);
        }
        commandsInitialized.push({
          name: command.name,
          slash: command.slashCommand?.enabled,
        });
      }

      for (const file of commandFiles) {
        const command: Command = new Command(require(`${commandsPath}/${file}`));

        bot.commands.set(command.name.toLowerCase(), command);
        if (command.slashCommand?.enabled) {
          CommandsRegister.registerSlashCommand(bot, command);
        }
        commandsInitialized.push({
          name: command.name,
          slash: command.slashCommand?.enabled,
        });
      }
      console.log('\x1b[36m', '# - - - - COMMANDS - - - - #');
      console.log(
        `# Slash commands : ${commandsInitialized
          .filter((c) => c.slash)
          .map((c) => bot.config.prefix + c.name)
          .join(', ')}`,
      );
      console.log(
        `# Basic commands : ${commandsInitialized
          .filter((c) => !c.slash)
          .map((c) => bot.config.prefix + c.name)
          .join(', ')}`,
      );
      console.log('# - - - - COMMANDS - - - - #\n', '\x1b[0m');
    } else {
      throw new Error('./commands folder not found ! Please create it and put your commands files inside it.');
    }
  }

  static registerSlashCommand(bot: Bot, command: Command) {
    bot.guilds.cache.forEach((guild) => {
      bot.application?.commands.create(
        {
          name: command.name,
          description: command.description,
          options: (command.slashCommand as any).options,
          type: ApplicationCommandType.ChatInput,
        },
        guild.id,
      );
    });
  }
}
