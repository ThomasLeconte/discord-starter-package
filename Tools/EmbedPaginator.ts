import { Message } from "discord.js";
import { Bot } from "../Bot";
import EmbedMessage, { EmbedContent, EmbedProperties } from "./EmbedMessage";
import { MessageFormatter } from "./MessageFormatter";

export type PaginationOption = { itemsPerPage?: number, previousIcon?: string, nextIcon?: string, previousLabel?: string, nextLabel?: string }
export default class EmbedPaginator {

  constructor(client: Bot, msg: Message, content: EmbedContent[], embedOptions: EmbedProperties, paginationOptions?: PaginationOption) {

    const previousLabel = paginationOptions?.previousLabel || "Previous";
    const previousIcon = paginationOptions?.previousIcon || "⏮️";
    const nextLabel = paginationOptions?.nextLabel || "Next";
    const nextIcon = paginationOptions?.nextIcon || "⏭️";
    const itemsPerPage = paginationOptions?.itemsPerPage || 10;

    let page = 1
    let chunk: EmbedContent[] = []
    chunk = content.slice(0, itemsPerPage);

    let embed = new EmbedMessage(client, embedOptions)
    embed.setFields([])
    chunk.forEach(line => {
      embed.addField(line.name, line.content)
    })

    const previousID = msg.id + "-previous";
    const nextID = msg.id + "-next";

    msg.reply(new MessageFormatter()
      .addEmbedMessage(embed)
      .addButton(previousLabel, previousIcon, "PRIMARY", previousID, true)
      .addButton(nextLabel, nextIcon, "PRIMARY", nextID)
      .format()
    ).then((message) => {
      const collector = message.createMessageComponentCollector({ time: 9999999, componentType: "BUTTON" })
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
              .addEmbedMessage(new EmbedMessage(client, { title: (embedOptions.title ? embedOptions.title : "Page ") + page, content: chunk }))
              .addButton(previousLabel, previousIcon, "PRIMARY", previousID, page == 1)
              .addButton(nextLabel, nextIcon, "PRIMARY", nextID)
              .format())
          } else if (interaction.customId == nextID) {
            interaction.update(new MessageFormatter()
              .addEmbedMessage(new EmbedMessage(client, { title: (embedOptions.title ? embedOptions.title : "Page ") + page, content: chunk }))
              .addButton(previousLabel, previousIcon, "PRIMARY", previousID)
              .addButton(nextLabel, nextIcon, "PRIMARY", nextID, endIndex >= content.length)
              .format())
          }
        }
        return;
      })
    })
  }
}