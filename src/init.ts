import { exec } from 'child_process';
import { Bot, BotConfig } from './Bot';
import { consoleError, consoleWarn } from './Tools/LogUtils';
import { lt } from 'es-semver';

function init(config: BotConfig): Promise<Bot> {
  // const bot = new Bot(config);
  return checkConfiguration(config)
    .then((validConfig) => {
      return new Bot(validConfig);
    })
    .finally(() => {
      checkPackageVersion();
    });
}

function checkConfiguration(config: BotConfig): Promise<BotConfig> {
  if (config.token === undefined || config.token === '') {
    throw new Error('No token provided in the configuration !');
  }

  if (!config.name) consoleWarn("⚠️ No name provided in the configuration, using default name : 'Discord Bot'");

  if (!config.options) {
    consoleWarn(
      "⚠️ No options provided in the configuration, using default options : { intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'] }",
    );
  } else {
    if (!config.options.intents) {
      consoleWarn(
        "⚠️ No intents provided in the configuration, using default intents : { intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'] }",
      );
    }
    if (!(config.options.intents as string[]).includes('MessageContent')) {
      consoleError('🧨 No MessageContent intent provided in the configuration, basic commands will not be available.');
    }
  }

  if (!config.prefix) consoleWarn("⚠️ No prefix provided in the configuration, using default prefix : '/'");

  // if (!config.defaultCommandsDisabled)
  //   consoleWarn(
  //     '⚠️ No defaultCommandsDisabled provided in the configuration, using default defaultCommandsDisabled : []',
  //   );

  if (config.autoLog === undefined)
    consoleWarn('⚠️ No autoLog provided in the configuration, using default autoLog : false');

  if (!config.adminRole)
    consoleWarn("⚠️ No adminRole provided in the configuration, using default adminRole : 'Admin'");

  if (!config.commandFolders) consoleWarn("⚠️ No commandFolders set, defaulting to ['commands']");

  config.name = config.name || 'Discord Bot';
  config.options = config.options || { intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'] };
  config.prefix = config.prefix || '/';
  config.defaultCommandsDisabled = config.defaultCommandsDisabled || [];
  config.autoLog = config.autoLog || false;
  config.adminRole = config.adminRole || 'Admin';
  config.commandFolders = config.commandFolders || ['commands'];

  return Promise.resolve(config);
}

function checkPackageVersion() {
  const packageJson = require('../package.json');
  const userPackageJson = require(`${require.main?.path}/package.json`);
  exec(`npm show ${packageJson.name} version`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error(exec) during version check process: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`Error(stderr) during version check process: ${stderr}`);
      return;
    }
    if (stdout) {
      const npmPackageVersion = stdout.trim().replace('^', '');
      const userPackageVersion = userPackageJson.dependencies[packageJson.name].replace('^', '');

      if (lt(userPackageVersion, npmPackageVersion)) {
        consoleWarn(
          `⚠️ You are using an outdated version of ${
            packageJson.name
          } ! Please update to the latest version (${stdout.trim()})`,
        );
      }

      if (userPackageJson.dependencies['discord.js']) {
        const packageDiscordVersionDependency = packageJson.dependencies['discord.js'].replace('^', '');
        const userDiscordVersionDependency = userPackageJson.dependencies['discord.js'].replace('^', '');
        if (lt(userDiscordVersionDependency, packageDiscordVersionDependency)) {
          consoleWarn(
            `🧨 You are using a different version of discord.js ! Please update discord.js package version to ${packageDiscordVersionDependency} for the best compatibility with ${packageJson.name}.`,
          );
        }
      }
    }
  });
}

export { init };
