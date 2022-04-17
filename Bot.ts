import { Client, Collection, ClientOptions, Message, ApplicationCommand, Interaction } from 'discord.js';
import { MessageHandler } from './Tools/MessageHandler';
import { CommandsRegister } from './Tools/CommandsRegister';
import EmbedMessage from './Tools/EmbedMessage';
import { MessageFormatter } from './Tools/MessageFormatter';
import { InteractionHandler } from './Tools/InteractionHandler';
import { CacheManager } from './Tools/CacheManager';

export class Bot extends Client {
  commands: Collection<String, any> = new Collection();
  disabledCommands: Collection<String, any> = new Collection();
  config: BotConfig;
  interactionHandler: InteractionHandler;
  logger: CacheManager;

  constructor(config: BotConfig) {
    super(config.options);
    this.config = config;
    this.login().then(() => {
      this.initializeTools();
    }).catch(err => {
      console.error(err);
      this.destroy();
    });
  }

  login() {
    return super.login(this.config.token);
  }

  initializeTools() {
    CommandsRegister.registerCommands(this);
    this.interactionHandler = new InteractionHandler(this);
    this.interactionHandler.listen();
    new MessageHandler(this).listen();
    this.logger = new CacheManager(this);
  }

  log(content: string, prefix: string = null) {
    this.logger.addLog(content, prefix);
  }

  name() {
    return this.config.name;
  }

  /**
   * Create a new item in context menu of Discord
   * @param name name of the command
   * @param guildId OPTIONNAL - if provided, the command will be executed only in this guild, otherwise it will be executed in all guilds
   */
  addContextMenuItem(name: string, guildId: string = null) {
    if (guildId != null) {
      this.application.commands.create({
        name,
        type: 'USER',
        defaultPermission: true
      }, guildId);
    } else {
      this.guilds.cache.forEach(guild => {
        this.application.commands.create({
          name,
          type: 'USER',
          defaultPermission: true
        }, guild.id);
      });
    }
  }

  /**
   * 
   * @param message message received from user
   * @param content content to send in response to message received
   */
  sendMessage(message: Message, content: string | EmbedMessage | MessageFormatter) {
    if (content instanceof EmbedMessage) {
      message.channel.send({ embeds: [content] });
    } else if (content instanceof MessageFormatter) {
      message.channel.send(content.format());
    } else {
      message.channel.send(content);
    }
  }

  /**
   * 
   * @param eventType type of event to listen
   * @param key Button / Select Menu custom ID or Context Menu name
   * @param callback function to execute when event is triggered
   */
  setNewEvent(eventType: EventType, key: string, callback: (interaction: Interaction) => void) {
    switch (eventType) {
      case EventType.BUTTON_EVENT:
        this.interactionHandler.newButtonEvent(key, callback);
        break;
      case EventType.SELECT_MENU_EVENT:
        this.interactionHandler.newSelectMenuEvent(key, callback);
        break;
      case EventType.CONTEXT_MENU_EVENT:
        this.interactionHandler.newContextMenuEvent(key, callback);
    }
  }
}

export enum EventType {
  BUTTON_EVENT = 'BUTTON',
  SELECT_MENU_EVENT = 'SELECT_MENU',
  CONTEXT_MENU_EVENT = 'CONTEXT_MENU'
}

export type SlashCommandConfig = { enabled: boolean, options: object[] }
export class BotConfig {
  name: string;
  token: string;
  prefix: string;
  slashCommands: SlashCommandConfig;
  autoLog: boolean;
  options: ClientOptions;
  adminRole: string;

  constructor(config: any) {
    this.name = config.name;
    this.token = config.token;
    this.prefix = config.prefix;
    this.slashCommands = config.slashCommands;
    this.autoLog = config.autoLog;
    this.options = config.options;
    this.adminRole = config.adminRole;
  }
}

export class Command {
  name: string;
  description: string;
  usage: string;
  slashCommand: boolean;
  admin: boolean;
  execute: void;

  constructor(data: any) {
    if (data.name != undefined && data.description != undefined && data.usage != undefined && data.slashCommand != undefined
      && data.admin != undefined && data.execute != undefined) {
      this.name = data.name;
      this.description = data.description;
      this.usage = data.usage;
      this.slashCommand = data.slashCommand;
      this.admin = data.admin;
      this.execute = data.execute;
    } else {
      throw new Error(`You must specify name, description, usage, slashCommand, admin property and execute function to your "${data.name}" command.`);
    }
  }
}