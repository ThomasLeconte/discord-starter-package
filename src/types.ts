import { ClientOptions, SlashCommandBuilder } from 'discord.js';

export type SelectOption = { label: string; description?: string; value: string };

export type SlashCommandConfig = { data: SlashCommandBuilder };

export type WebHookConfig = { name: string; url: string };

export type BotConfig = {
  name?: string;
  token: string;
  prefix?: string;
  commandsDisabled?: string[];
  autoLog?: boolean;
  options: ClientOptions;
  adminRole?: string;
  webhooks?: WebHookConfig[];
  commandFolders?: string[];
};
