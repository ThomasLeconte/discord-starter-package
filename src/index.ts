import { Bot, EventType, Command } from './Bot';
import { ErrorEmbed, SuccessEmbed, EmbedMessage } from './Tools/EmbedMessage';
import { EmbedPaginator, PaginationOption } from './Tools/EmbedPaginator';
import ModalConstructor from './Tools/ModalConstructor';
import { MessageFormatter, SelectMenuType } from './Tools/MessageFormatter';
import { init } from './init';

export {
  Bot,
  init,
  Command,
  EventType,
  SelectMenuType,
  ErrorEmbed,
  SuccessEmbed,
  EmbedMessage,
  EmbedPaginator,
  PaginationOption,
  ModalConstructor,
  MessageFormatter,
};

// export { Bot, EventType, Command } from "./Bot";
// export { ErrorEmbed, SuccessEmbed, EmbedMessage } from "./Tools/EmbedMessage";
// export {EmbedPaginator, PaginationOption} from "./Tools/EmbedPaginator";
// export * as ModalConstructor from "./Tools/ModalConstructor";
// export { MessageFormatter } from "./Tools/MessageFormatter";
// export { init } from "./init";
