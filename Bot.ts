import { Client, Collection, ClientOptions, Message, Interaction } from 'discord.js';
import { MessageHandler } from './Tools/MessageHandler';
import { CommandsRegister } from './Tools/CommandsRegister';
import EmbedMessage from './Tools/EmbedMessage';
import { MessageFormatter } from './Tools/MessageFormatter';

export class Bot extends Client {
  commands: Collection<String, any> = new Collection();
  disabledCommands: Collection<String, any> = new Collection();
  config: BotConfig;
  handler: MessageHandler;

  constructor(config: BotConfig) {
    super(config.options);
    this.config = config;
    this.login().then(() => {
      CommandsRegister.registerCommands(this);
      this.handler = new MessageHandler(this);
      this.handler.listen();
    }).catch(err => {
      console.error(err);
      this.destroy();
    });
  }

  login(){
    return super.login(this.config.token);
  }

  name(){
    return this.config.name;
  }

  sendMessage(message: Message, content: string | EmbedMessage | MessageFormatter){
    if (content instanceof EmbedMessage) {
      message.channel.send({ embeds: [content] });
    } else if (content instanceof MessageFormatter) {
      message.channel.send(content.format());
    } else {
      message.channel.send(content);
    }
  }

  makeSheduledTask(duration: number, callback: () => void | void){
    setInterval(callback, duration * 1000);
  }

  setNewEvent(eventType: EventType, customId: string, callback: (interaction: Interaction) => void){
    switch(eventType){
      case EventType.BUTTON_EVENT:
        this.handler.newButtonEvent(customId, callback);
        break;
      case EventType.SELECT_MENU_EVENT:
        this.handler.newSelectMenuEvent(customId, callback);
        break;
    }
  }
}

export enum EventType {
  BUTTON_EVENT = 'BUTTON',
  SELECT_MENU_EVENT = 'SELECT_MENU'
}

export type SlashCommandConfig = {enabled: boolean, options: object[] }
export class BotConfig {
  name: string;
  token: string;
  prefix: string;
  slashCommands: SlashCommandConfig;
  options: ClientOptions;
  adminRole: string;

  constructor(config: any) {
    this.name = config.name;
    this.token = config.token;
    this.prefix = config.prefix;
    this.slashCommands = config.slashCommands;
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
    }else{
      throw new Error(`You must specify name, description, usage, slashCommand, admin property and execute function to your "${data.name}" command.`);
    }
  }
}