import { ButtonStyle, EmbedField, Message } from 'discord.js';
import { Bot } from '../models/bot';
import { EmbedMessage } from './EmbedMessage';
import { MessageFormatter } from './MessageFormatter';

type EmbedOptions = { title?: string; description?: string };

export type PaginationOption = {
  itemsPerPage?: number;
  previousIcon?: string;
  nextIcon?: string;
  previousLabel?: string;
  nextLabel?: string;
};
export class EmbedPaginator {
  private content: EmbedField[];
  private embedOptions: EmbedOptions;
  private paginationOptions: PaginationOption;
  private page = 1;
  private result: MessageFormatter;
  private ids: { previousID: string; nextID: string };

  constructor(
    client: Bot,
    msg: Message,
    content: EmbedField[],
    embedOptions: EmbedOptions,
    paginationOptions?: PaginationOption,
  ) {
    this.paginationOptions = paginationOptions ?? {};
    this.embedOptions = embedOptions;
    this.content = content;

    let chunk: EmbedField[] = [];
    chunk = content.slice(0, this.paginationOptions.itemsPerPage);

    const embed = EmbedMessage(client, embedOptions.title, embedOptions.description);
    embed.setFields([]);
    chunk.forEach((line) => {
      embed.addFields({ name: line.name, value: line.value });
    });

    const previousID = msg.id + '-previous';
    const nextID = msg.id + '-next';
    this.ids = { previousID, nextID };

    this.result = new MessageFormatter()
      .addEmbedMessage(embed)
      .addButton(this.getPreviousLabel(), this.getPreviousIcon(), ButtonStyle.Primary, previousID, true)
      .addButton(this.getNextLabel(), this.getNextIcon(), ButtonStyle.Primary, nextID)
      .format();
  }

  getResult() {
    return this.result;
  }

  getIDs() {
    return this.ids;
  }

  getPage() {
    return this.page;
  }

  setPage(page: number) {
    this.page = page;
  }

  getOptions() {
    return this.paginationOptions;
  }

  getItemsPerPage() {
    return this.paginationOptions.itemsPerPage || 10;
  }

  getEmbedTitle() {
    return this.embedOptions.title || 'Page ' + this.page;
  }

  getPreviousLabel() {
    return this.paginationOptions.previousLabel || 'Previous';
  }

  getNextLabel() {
    return this.paginationOptions.nextLabel || 'Next';
  }

  getPreviousIcon() {
    return this.paginationOptions.previousIcon || '⏮️';
  }

  getNextIcon() {
    return this.paginationOptions.nextIcon || '⏭️';
  }

  getEmbedOptions() {
    return this.embedOptions;
  }

  getContent() {
    return this.content;
  }
}
