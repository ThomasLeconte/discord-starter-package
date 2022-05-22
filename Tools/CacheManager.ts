import { Bot } from "../Bot";
import * as fs from "fs";

export class CacheManager {
  private bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  addLog(content: string, prefix: string | null = null) {
    fs.existsSync('./logs') || fs.mkdirSync('./logs');
    fs.appendFileSync('./logs/log.txt', `${prefix != null ? "[" + prefix + "] #" : new Date().toLocaleString()} - ${content}\n`);
  }
}