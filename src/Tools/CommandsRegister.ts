import { REST, Routes } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { Bot, Command } from '../Bot';

export class CommandsRegister {
  static async registerCommands(bot: Bot) {
    const commandsPath = `${require.main?.path}/commands`;
    const defaultCommandsPath = path.join(__dirname, '../commands');

    if (fs.existsSync(commandsPath)) {
      const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));
      const defaultCommandFiles = fs.readdirSync(defaultCommandsPath).filter((file) => file.endsWith('.js'));
      const commandsInitialized = [] as any[];
      const slashCommandsToRegister = [] as Command[];

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

      // REGISTER SLASH COMMANDS
      return this.registerSlashCommands(bot, slashCommandsToRegister)
        .then(() => {
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
        })
        .catch((err) => console.error(err));
    } else {
      throw new Error('./commands folder not found ! Please create it and put your commands files inside it.');
    }
  }

  static async registerSlashCommands(bot: Bot, commands: Command[]) {
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
          await rest.delete(Routes.applicationCommand(bot.user!.id, command.id))
          .then(() => {
            console.log(`Deleted ${command.name} slash command`);
          });
        }

        return { commandsToCreate, commandsToUpdate };
      })
      .then(async ({ commandsToCreate, commandsToUpdate }) => {
        await rest
          .put(Routes.applicationCommands(bot.user!.id), {
            body: commandsToUpdate.concat(commandsToCreate).map((c) => c.slashCommand?.data.toJSON()),
          })
          .then((result) => {
            console.log(`Updated ${(result as any[]).map(r => r.name.join(', '))} slash commands`);
          });
      });
  }
}
