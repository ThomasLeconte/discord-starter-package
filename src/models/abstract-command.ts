import { Interaction, Message, SlashCommandBuilder } from 'discord.js';
import { Bot } from './bot';

export default abstract class AbstractCommand {
  protected abstract name: string;
  protected abstract description: string;
  protected abstract usage: string;
  protected abstract admin: boolean;
  protected roles?: string[];
  protected slashCommand?: { data: SlashCommandBuilder };
  protected private?: boolean;

  getMeta(): any {
    return {
      name: this.name,
      description: this.description,
      usage: this.usage,
      admin: this.admin,
      roles: this.roles,
      slashCommand: this.slashCommand,
      private: this.private,
      execute: this.execute,
      isClassCommand: true,
    };
  }

  abstract execute(client: Bot, message: Message | Interaction, args: any[]): any;
}
