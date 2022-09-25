import {
  Client,
  Collection,
  ClientOptions,
  Message,
  Interaction,
  WebhookClient,
  EmbedBuilder,
  ApplicationCommandType,
} from 'discord.js';
import { MessageHandler } from './Tools/MessageHandler';
import { CommandsRegister } from './Tools/CommandsRegister';
import { MessageFormatter } from './Tools/MessageFormatter';
import { InteractionHandler } from './Tools/InteractionHandler';
import { CacheManager } from './Tools/CacheManager';

export class Bot extends Client {
  commands: Collection<string, any> = new Collection();
  disabledCommands: Collection<string, any> = new Collection();
  config: BotConfig;
  interactionHandler?: InteractionHandler;
  logger?: CacheManager;
  webhooks: Collection<string, WebhookClient> = new Collection();

  constructor(config: BotConfig) {
    super(config.options);
    this.config = config;
    this.login()
      .then(() => {
        this.initializeTools();
      })
      .catch((err: Error) => {
        console.error(err);
        this.destroy();
      });
  }

  login() {
    return super.login(this.config.token);
  }

  private initializeTools() {
    CommandsRegister.registerCommands(this);
    this.interactionHandler = new InteractionHandler(this);
    this.interactionHandler.listen();
    new MessageHandler(this).listen();
    this.logger = new CacheManager(this);
    if (this.config.webhooks && this.config.webhooks.length > 0) {
      this.initWebHooks();
    }
    console.log('\x1b[35m', '# - - - - BOT - - - - #');
    const inviteURL =
      'https://discord.com/api/oauth2/authorize?client_id=' +
      this.user?.id +
      '&permissions=0&scope=bot%20applications.commands';
    console.log('# Invitation link : ' + inviteURL);
    console.log('# - - - - BOT - - - - #', '\x1b[0m');
  }

  private initWebHooks() {
    if (this.config.webhooks) {
      console.log('# - - - - WEBHOOK - - - - #');
      for (const wh of this.config.webhooks) {
        const urlSplitted = wh.url.split('/');
        const client = new WebhookClient({
          id: urlSplitted[urlSplitted.length - 2],
          token: urlSplitted[urlSplitted.length - 1],
        });
        this.webhooks.set(wh.name, client);
        console.log(`# "${wh.name}" WebHook has been successfully initialized !`);
      }
      console.log('# - - - - WEBHOOK - - - - #');
    }
  }

  log(content: string, prefix: string | null = null) {
    if (!this.logger) {
      this.logger = new CacheManager(this);
    }
    this.logger.addLog(content, prefix);
  }

  name() {
    return this.config.name;
  }

  /**
   *
   * @param name name of the webhook configured
   * @returns
   */
  getWebHook(name: string): WebhookClient | undefined {
    if (this.webhooks.size > 0) {
      if (this.webhooks.has(name)) {
        return this.webhooks.get(name);
      } else {
        throw Error(`"${name}" Webhook does not exists in your current environment config !`);
      }
    } else {
      throw Error('Webhooks of you current environment is empty !');
    }
  }

  /**
   * Create a new item in context menu of Discord
   * @param name name of the command
   * @param guildId OPTIONNAL - if provided, the command will be executed only in this guild, otherwise it will be executed in all guilds
   */
  addContextMenuItem(name: string, guildId: string | null = null) {
    if (guildId !== null) {
      this.application?.commands.create(
        {
          name,
          type: ApplicationCommandType.User,
        },
        guildId,
      );
    } else {
      this.guilds.cache.forEach((guild) => {
        this.application?.commands.create(
          {
            name,
            type: ApplicationCommandType.User,
          },
          guild.id,
        );
      });
    }
  }

  /**
   *
   * @param message message received from user
   * @param content content to send in response to message received
   */
  sendMessage(message: Message, content: string | EmbedBuilder | MessageFormatter) {
    if (typeof content === 'string') {
      message.channel.send(content);
    } else {
      switch (content.constructor.name) {
        case 'EmbedBuilder':
          message.channel.send({ embeds: [content as EmbedBuilder] });
          break;
        case 'MessageFormatter':
          message.channel.send((content as MessageFormatter).format());
          break;
      }
    }
  }

  /**
   *
   * @param eventType type of event to listen
   * @param key Button / Select Menu custom ID or Context Menu name
   * @param callback function to execute when event is triggered
   */
  setNewEvent(eventType: EventType, key: string, callback: (interaction: Interaction) => void) {
    if (!this.interactionHandler) {
      this.interactionHandler = new InteractionHandler(this);
    }
    switch (eventType) {
      case EventType.BUTTON_EVENT:
        this.interactionHandler.newButtonEvent(key, callback);
        break;
      case EventType.SELECT_MENU_EVENT:
        this.interactionHandler.newSelectMenuEvent(key, callback);
        break;
      case EventType.CONTEXT_MENU_EVENT:
        this.interactionHandler.newContextMenuEvent(key, callback);
        break;
      case EventType.MODAL_SUBMIT_EVENT:
        this.interactionHandler.newModalEvent(key, callback);
        break;
    }
  }
}

export enum EventType {
  BUTTON_EVENT = 'BUTTON',
  SELECT_MENU_EVENT = 'SELECT_MENU',
  CONTEXT_MENU_EVENT = 'CONTEXT_MENU',
  MODAL_SUBMIT_EVENT = 'MODAL_SUBMIT',
}

export type SlashCommandConfig = { enabled: boolean; options?: object[] };
export type WebHookConfig = { name: string; url: string };
export type BotConfig = {
  name?: string;
  token: string;
  prefix?: string;
  defaultCommandsDisabled?: string[];
  autoLog?: boolean;
  options: ClientOptions;
  adminRole?: string;
  webhooks?: WebHookConfig[];
};

export class Command {
  name: string;
  description: string;
  usage: string;
  slashCommand: SlashCommandConfig;
  admin: boolean;
  // alias?: string[];
  execute: void;

  constructor(data: any) {
    if (
      data.name !== undefined &&
      data.description !== undefined &&
      data.usage !== undefined &&
      data.slashCommand !== undefined &&
      data.admin !== undefined &&
      data.execute !== undefined
    ) {
      this.name = data.name;
      this.description = data.description;
      this.usage = data.usage;
      this.slashCommand = data.slashCommand;
      this.admin = data.admin;
      // this.alias = data.alias;
      this.execute = data.execute;
    } else {
      throw new Error(
        `You must specify name, description, usage, slashCommand, admin property and execute function to your "${data.name}" command.`,
      );
    }
    // if(this.alias){
    //   if(!Array.isArray(this.alias)){
    //     throw new Error(`Alias property of your "${this.name}" command must be an array !`);
    //   }
    // }
  }
}
