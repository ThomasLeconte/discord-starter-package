import { APIEmbedField, ButtonStyle, ComponentType, Embed, Message } from "discord.js";
import { Bot } from "../Bot";
import { EmbedMessage } from "./EmbedMessage";
import { MessageFormatter } from "./MessageFormatter";

type EmbedOptions = { title?: string, description?: string };

export type PaginationOption = { itemsPerPage?: number, previousIcon?: string, nextIcon?: string, previousLabel?: string, nextLabel?: string }
export default class EmbedPaginator {

  constructor(client: Bot, msg: Message, content: APIEmbedField[], embedOptions: EmbedOptions, paginationOptions?: PaginationOption) {

    const previousLabel = paginationOptions?.previousLabel || "Previous";
    const previousIcon = paginationOptions?.previousIcon || "⏮️";
    const nextLabel = paginationOptions?.nextLabel || "Next";
    const nextIcon = paginationOptions?.nextIcon || "⏭️";
    const itemsPerPage = paginationOptions?.itemsPerPage || 10;

    let page = 1
    let chunk: APIEmbedField[] = []
    chunk = content.slice(0, itemsPerPage);

    let embed = EmbedMessage(client, embedOptions.title, embedOptions.description)
    embed.setFields([])
    chunk.forEach(line => {
      embed.addFields({ name: line.name, value: line.value })
    })

    const previousID = msg.id + "-previous";
    const nextID = msg.id + "-next";

    msg.reply(new MessageFormatter()
      .addEmbedMessage(embed)
      .addButton(previousLabel, previousIcon, ButtonStyle.Primary, previousID, true)
      .addButton(nextLabel, nextIcon, ButtonStyle.Primary, nextID)
      .format()
    ).then((message) => {
      const collector = message.createMessageComponentCollector({ time: 9999999, componentType: ComponentType.Button })
      collector.on('collect', (interaction) => {

        if (interaction.user.id == msg.author.id) {
          if (interaction.customId == previousID) page--;
          if (interaction.customId == nextID) page++;

          const startIndex = page == 1 ? 0 : (page * itemsPerPage) - itemsPerPage
          const endIndex = page * itemsPerPage

          chunk = content.slice(startIndex, endIndex);
          // console.log(page, startIndex, endIndex)

          if (interaction.customId == previousID) {
            interaction.update(new MessageFormatter()
              .addEmbedMessage(EmbedMessage(client, (embedOptions.title ? embedOptions.title : "Page ") + page, embedOptions.description,  chunk))
              .addButton(previousLabel, previousIcon, ButtonStyle.Primary, previousID, page == 1)
              .addButton(nextLabel, nextIcon, ButtonStyle.Primary, nextID)
              .format());
          } else if (interaction.customId == nextID) {
            interaction.update(new MessageFormatter()
              .addEmbedMessage(EmbedMessage(client, (embedOptions.title ? embedOptions.title : "Page ") + page, embedOptions.description, chunk))
              .addButton(previousLabel, previousIcon, ButtonStyle.Primary, previousID)
              .addButton(nextLabel, nextIcon, ButtonStyle.Primary, nextID, endIndex >= content.length)
              .format())
          }
        }
        return;
      })
    })
  }
}