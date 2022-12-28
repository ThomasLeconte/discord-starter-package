import { Bot } from '../Bot';
import * as fs from 'fs';

export class CacheManager {
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
