import { SlashCommandConfig } from '../types';

export class Command {
  name: string;
  description: string;
  usage: string;
  slashCommand?: SlashCommandConfig;
  admin: boolean;
  // alias?: string[];
  execute: void;
  private?: boolean;
  filePath: string;
  isClassCommand: boolean = false;

  constructor(data: any, filePath: string) {
    this.filePath = filePath;
    this.private = data.private !== undefined ? data.private : false;
    if (data.slashCommand !== undefined) {
      if (data.slashCommand.data === undefined) {
        throw new Error(
          `You must specify data property to your "${data.name}" slash command. It must be a SlashCommandBuilder object.`,
        );
      } else {
        this.slashCommand = data.slashCommand !== undefined ? data.slashCommand : null;
      }
    }

    if (
      data.name !== undefined &&
      data.description !== undefined &&
      data.usage !== undefined &&
      data.admin !== undefined &&
      data.execute !== undefined
    ) {
      this.name = data.name;
      this.description = data.description;
      this.usage = data.usage;
      this.admin = data.admin;
      // this.alias = data.alias;
      this.execute = data.execute;
    } else {
      throw new Error(
        `You must specify name, description, usage, admin property and execute function to your "${data.name}" command.`,
      );
    }
    // if(this.alias){
    //   if(!Array.isArray(this.alias)){
    //     throw new Error(`Alias property of your "${this.name}" command must be an array !`);
    //   }
    // }
  }
}
