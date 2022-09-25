import { Bot, BotConfig } from './Bot';
import { exec } from 'child_process';

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
  if (!config.token) {
    throw new Error('No token provided in the configuration !');
  }
  if (!config.name) console.warn("⚠️ No name provided in the configuration, using default name : 'Discord Bot'");
  config.name = config.name || 'Discord Bot';
  if (!config.options)
    console.warn(
      "⚠️ No options provided in the configuration, using default options : { intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'] }",
    );
  config.options = config.options || { intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'] };
  if (!config.prefix) console.warn("⚠️ No prefix provided in the configuration, using default prefix : '/'");
  config.prefix = config.prefix || '/';
  if (!config.defaultCommandsDisabled)
    console.warn(
      '⚠️ No defaultCommandsDisabled provided in the configuration, using default defaultCommandsDisabled : []',
    );
  config.defaultCommandsDisabled = config.defaultCommandsDisabled || [];
  if (!config.autoLog) console.warn('⚠️ No autoLog provided in the configuration, using default autoLog : false');
  config.autoLog = config.autoLog || false;
  if (!config.adminRole)
    console.warn("⚠️ No adminRole provided in the configuration, using default adminRole : 'Admin'");
  config.adminRole = config.adminRole || 'Admin';

  return Promise.resolve(config);
}

function checkPackageVersion() {
  const packageJson = require('../package.json');
  const projectPackageJson = require(`${require.main?.path}/package.json`);
  exec(`npm show ${packageJson.name} version`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    if (stdout) {
      if (stdout.trim() !== projectPackageJson.dependencies[packageJson.name].replace('^', '')) {
        console.warn(
          '\x1b[32m%s\x1b[0m',
          `⚠️ You are using an outdated version of ${
            packageJson.name
          } ! Please update to the latest version (${stdout.trim()})`,
        );
      }
    }
  });
}

export { init };
