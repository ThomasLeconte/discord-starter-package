import { Client, Collection, ClientOptions, Message, MessageEmbed } from 'discord.js';
import { CommandsRegister } from './Tools/CommandsRegister';
import EmbedMessage from './Tools/EmbedMessage';

export class Bot extends Client {
  commands: Collection<String, any> = new Collection();
  disabledCommands: Collection<String, any> = new Collection();
  config: BotConfig;

  constructor(config: BotConfig) {
    super(config.options);
    this.config = config;
    this.login().then(() => {
      CommandsRegister.registerCommands(this);
      this.handleMessages();
    }).catch(err => {
      console.error(err);
      this.destroy();
    });
  }

  login(){
    return super.login(this.config.token);
  }

  handleMessages(){
    this.on('messageCreate', async (msg) => {
      if(msg.author.bot) return;
      if (!msg.content.startsWith(this.config.prefix)) return;

      const args = msg.content.slice(this.config.prefix.length).split(' ');
      const command = args.shift().toLocaleLowerCase();

      if(this.disabledCommands.has(command)){
        this.sendMessage(msg, EmbedMessage.showError(this, `**${this.config.name} - Error**`, `The command "${command}" is disabled !`));
      }else{
        if (this.commands.has(command)) {
          await this.commands.get(command).execute(this, msg, args).then((result: string | EmbedMessage) => {
            if (result) this.sendMessage(msg, result);
          });
        } else {
          this.sendMessage(msg, EmbedMessage.showError(this, `**${this.config.name} - Error**`, `The command "${command}" does not exist.`));
        }
      }
    })

    this.on('interactionCreate', async interaction => {
      if(interaction.isApplicationCommand()){
        const args = (interaction.options as any)._hoistedOptions
        const channel = this.channels.cache.find(c => c.id == interaction.channelId)
        const guild = this.guilds.cache.get(interaction.guildId)
        let message = null
        await guild.members.fetch().then(members => {
          let member = members.get(interaction.member.user.id)
          if (args != undefined && args.find((a: any) => a.type == "USER") != null) {
            const mention_id = args.find((arg: any) => arg.type == "USER").value
            message = {
              guild: guild,
              channel: channel,
              member: member,
              author: member.user,
              mention: members.get(mention_id).user,
              interaction
            }
          } else {
            message = { guild: guild, channel: channel, member: member, author: member.user, interaction }
          }
        }).catch(err => console.error(err));

        const newArgs = args != undefined ? args.map((el: any) => el.value) : []
        await this.commands.get(interaction.command.name.toLocaleLowerCase()).execute(this, message, newArgs).then((result: any) => {
          if (result){
            if (result instanceof EmbedMessage) {
              interaction.reply({ embeds: [result] });
            } else {
              interaction.reply(result);
            }
          }
          return;
        });
      }
    })
  }

  name(){
    return this.config.name;
  }

  sendMessage(message: Message, content: MessageEmbed | string){
    message.reply(content instanceof MessageEmbed ? { embeds: [content] } : content);
  }

  makeSheduledTask(duration: number, callback: () => void | void){
    setInterval(callback, duration * 1000);
  }
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