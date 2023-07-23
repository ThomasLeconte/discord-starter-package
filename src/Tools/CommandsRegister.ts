import { REST, Routes } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { Bot, Command } from '../Bot';
import { consoleWarn } from './LogUtils';

export class CommandsRegister {
  static async registerCommands(bot: Bot) {
    const commandsPathPrefix = `${require.main?.path}/`;
    const commandFolders = bot.config.commandFolders;
    const commandsInitialized = [] as any[];
    const slashCommandsToRegister = [] as Command[];

    if (!commandFolders) {
      throw new Error('No commandFolders config value found');
    }

    this.initDefaultCommands(bot, commandsInitialized, slashCommandsToRegister);

    // LOOP THROUGH COMMAND_FOLDERS
    for (const commandFolder of commandFolders) {
      const commandsPath = commandsPathPrefix + commandFolder;

      if (fs.existsSync(commandsPath)) {
        const commandFiles = fs
          .readdirSync(commandsPath)
          .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

        // CUSTOM COMMANDS OF USER
        for (const file of commandFiles) {
          const command = new Command(require(`${commandsPath}/${file}`));

          bot.commands.set(command.name.toLowerCase(), command);
          if (command.slashCommand !== undefined) {
            slashCommandsToRegister.push(command);
          }
          commandsInitialized.push({
            name: command.name,
            slash: command.slashCommand !== undefined,
          });
        }
      } else {
        consoleWarn(
          `⚠️ ./${commandFolder} folder not found! Please create it or remove it from your commandFolders config!`,
        );
      }
    }

    // REGISTER SLASH COMMANDS
    return this.registerSlashCommands(bot, slashCommandsToRegister)
      .then(() => {
        console.log('\x1b[36m', '# - - - - COMMANDS - - - - #');
        console.log(
          `# Slash commands : ${commandsInitialized
            .filter((c) => c.slash)
            .map((c) => c.name)
            .join(', ')}`,
        );
        console.log(
          `# Basic commands : ${commandsInitialized
            .filter((c) => !c.slash)
            .map((c) => bot.config.prefix + c.name)
            .join(', ')}`,
        );
        console.log('# - - - - COMMANDS - - - - #\n', '\x1b[0m');
      })
      .catch((err) => console.error(err));
  }

  private static initDefaultCommands(bot: Bot, commandsInitialized: any[], slashCommandsToRegister: Command[]) {
    const defaultCommandsPath = path.join(__dirname, '../', 'commands');

    const defaultCommandFiles = fs.readdirSync(defaultCommandsPath).filter((file) => file.endsWith('.js'));

    // DEFAULT COMMANDS OF LIB
    for (const file of defaultCommandFiles) {
      if (bot.config.defaultCommandsDisabled!.includes(file.replace('.js', ''))) continue;
      const command = new Command(require(`${defaultCommandsPath}/${file}`));
      bot.commands.set(command.name.toLowerCase(), command);
      if (command.slashCommand) {
        if (command.slashCommand.data !== undefined) {
          slashCommandsToRegister.push(command);
        }
      }
      commandsInitialized.push({
        name: command.name,
        slash: command.slashCommand !== undefined,
      });
    }
  }

  private static async registerSlashCommands(bot: Bot, commands: Command[]) {
    if (!bot.config.token) throw new Error('Token not found !');
    if (!bot.user) throw new Error('Bot user not found !');

    const rest = new REST({ version: '10' }).setToken(bot.config.token);
    return rest
      .get(Routes.applicationCommands(bot.user.id))
      .then(async (existingCommands: unknown) => {
        const commandsToCreate = commands.filter(
          (c) => !(existingCommands as any[]).find((e: any) => e.name === c.name.toLowerCase()),
        );
        const commandsToUpdate = commands.filter(
          (c) =>
            c.name.toLowerCase() ===
            (existingCommands as any[]).find((e: any) => e.name === c.name.toLowerCase())?.name,
        );
        const commandsToDelete = (existingCommands as any[]).filter(
          (e: any) => !commands.find((c) => c.name.toLowerCase() === e.name),
        );

        return { commandsToCreate, commandsToUpdate, commandsToDelete };
      })
      .then(async ({ commandsToCreate, commandsToUpdate, commandsToDelete }) => {
        for (const command of commandsToDelete) {
          await rest.delete(Routes.applicationCommand(bot.user!.id, command.id));
          // .then(() => {
          //   console.log(`Deleted ${command.name} slash command`);
          // });
        }

        return { commandsToCreate, commandsToUpdate };
      })
      .then(async ({ commandsToCreate, commandsToUpdate }) => {
        await rest.put(Routes.applicationCommands(bot.user!.id), {
          body: commandsToUpdate.concat(commandsToCreate).map((c) => c.slashCommand?.data.toJSON()),
        });
        // .then((result) => {
        //   console.log(`Updated ${(result as any[]).map((r) => r.name.join(', '))} slash commands`);
        // });
      });
  }
}
