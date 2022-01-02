import { Bot } from "../Bot";
import * as fs from "fs";

export class CacheManager{
  private bot: Bot;

  constructor(bot: Bot){
    this.bot = bot;
  }

  addLog(content: string){
    fs.existsSync('./logs') || fs.mkdirSync('./logs');
    fs.appendFileSync('./logs/log.txt', `${new Date().toLocaleString()} - ${content}\n`);
  }
}