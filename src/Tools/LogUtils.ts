import { Bot } from '../Bot';
import * as fs from 'fs';

export class Logger {
  private bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  /**
   *
   * @param content message content
   * @param prefix Optional - Prefix before the message
   */
  addLog(content: string, prefix: string | null = null) {
    const path = `${require.main?.path}/logs`;
    fs.existsSync(path) || fs.mkdirSync(path);
    fs.appendFileSync(
      `${path}/log.txt`,
      `${prefix != null ? '[' + prefix + '] #' : new Date().toLocaleString()} - ${content}\n`,
    );
  }
}

export function consoleError(msg: string) {
  console.error('\x1b[31m%s\x1b[0m', msg);
}

export function consoleWarn(msg: string) {
  console.warn('\x1b[33m%s\x1b[0m', msg);
}
