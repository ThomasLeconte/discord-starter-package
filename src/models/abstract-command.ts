import { Message, SlashCommandBuilder } from 'discord.js';
import { Bot } from './bot';

export default abstract class AbstractCommand {
  protected abstract name: string;
  protected abstract desc: string;
  protected abstract usage: string;
  protected abstract admin: boolean;
  protected slashCommand?: { data: SlashCommandBuilder; private: boolean };
  protected private?: boolean;
  private filePath: string;

  constructor() {
    this.filePath = process.cwd();
  }

  getMeta(): any {
    return {
      name: this.name,
      desc: this.desc,
      usage: this.usage,
      admin: this.admin,
      slashCommand: this.slashCommand,
      private: this.private,
      filePath: this.filePath,
      execute: this.execute,
      isClassCommand: true,
    };
  }

  abstract execute(client: Bot, message: Message, args: any[]): any;
}
