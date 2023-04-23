import { ButtonInteraction, ButtonStyle, ComponentType, InteractionResponse, Message, User } from 'discord.js';
import { Bot } from '../Bot';
import { EmbedMessage } from '../Tools/EmbedMessage';
import { EmbedPaginator } from '../Tools/EmbedPaginator';
import { MessageFormatter } from '../Tools/MessageFormatter';

export class PaginationChangeHandler {
  private bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  public handleInteractionChanges(interaction: InteractionResponse, result: EmbedPaginator, isPrivateResult: boolean) {
    const collector = interaction.createMessageComponentCollector({
      time: 9999999,
      componentType: ComponentType.Button,
    });
    collector.on('collect', (interactionResult) => {
      console.log(interactionResult);
      this.updateInteraction(interactionResult, interaction.interaction.user.id, result);
      return;
    });
  }

  public handleMessageChanges(message: Message, author: User, result: EmbedPaginator, isPrivateResult: boolean) {
    const collector = message.createMessageComponentCollector({
      time: 9999999,
      componentType: ComponentType.Button,
    });
    collector.on('collect', (interactionResult) => {
      this.updateInteraction(interactionResult, author.id, result);
      return;
    });
  }

  private updateInteraction(buttonInteraction: ButtonInteraction, initialUserId: string, paginator: EmbedPaginator) {
    if (buttonInteraction.user.id === initialUserId) {
      if (buttonInteraction.customId === paginator.getIDs().previousID) paginator.setPage(paginator.getPage() - 1);
      if (buttonInteraction.customId === paginator.getIDs().nextID) paginator.setPage(paginator.getPage() + 1);

      const startIndex =
        paginator.getPage() === 1 ? 0 : paginator.getPage() * paginator.getItemsPerPage() - paginator.getItemsPerPage();
      const endIndex = paginator.getPage() * paginator.getItemsPerPage();

      const chunk = paginator.getContent().slice(startIndex, endIndex);

      if (buttonInteraction.customId === paginator.getIDs().previousID) {
        buttonInteraction.update(
          new MessageFormatter()
            .addEmbedMessage(
              EmbedMessage(this.bot, paginator.getEmbedTitle(), paginator.getEmbedOptions().description, chunk),
            )
            .addButton(
              paginator.getPreviousLabel(),
              paginator.getPreviousIcon(),
              ButtonStyle.Primary,
              paginator.getIDs().previousID,
              paginator.getPage() === 1,
            )
            .addButton(
              paginator.getNextLabel(),
              paginator.getNextIcon(),
              ButtonStyle.Primary,
              paginator.getIDs().nextID,
            )
            .format(),
        );
      } else if (buttonInteraction.customId === paginator.getIDs().nextID) {
        buttonInteraction.update(
          new MessageFormatter()
            .addEmbedMessage(
              EmbedMessage(this.bot, paginator.getEmbedTitle(), paginator.getEmbedOptions().description, chunk),
            )
            .addButton(
              paginator.getPreviousLabel(),
              paginator.getPreviousIcon(),
              ButtonStyle.Primary,
              paginator.getIDs().previousID,
            )
            .addButton(
              paginator.getNextLabel(),
              paginator.getNextIcon(),
              ButtonStyle.Primary,
              paginator.getIDs().nextID,
              endIndex >= paginator.getContent().length,
            )
            .format(),
        );
      }
    }
    return;
  }
}
