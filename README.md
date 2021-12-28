# DiscordBot Starter
Little package for start a discord bot fastly and easily with TypeScript.  
**Disclaimer:** This is not the best way, just my favorite way to build a discord bot. You can propose your own ideas with a pull request 😉

## How use it ?
First of all, you need to create a `config.json` file on your project root.
Then, just copy this into your new file :
```json
{
  "env": "DEV",
  "environments": {
    "DEV": {
      "name": "YourBotName",
      "token": "YourBotPrivateToken",
      "prefix": "/",
      "slashCommands": false,
      "adminRole": "admin",
      "options": {
        "intents": [
          "GUILDS",
          "GUILD_MEMBERS",
          "GUILD_MESSAGES"
        ]
      }
    },
    "PROD": {
      "name": "YourBotName",
      "token": "YourBotPrivateToken",
      "prefix": "/",
      "slashCommands": false,
      "adminRole": "admin",
      "options": {
        "intents": [
          "GUILDS",
          "GUILD_MEMBERS",
          "GUILD_MESSAGES"
        ]
      }
    }
  }
}
```
By default, bot environment will be "DEV". You can change it to "PROD", or to your personalized environment name !
Now, have a look to all properties of an environment :  
- `name`: Your bot name
- `token`: Your bot private token
- `prefix`: Your bot prefix which be used at start of all your commands (when slash command option is not enabled on command)
- `slashCommands`: Precise if you want to use Slash Commands system on all your commands.
- `adminRole`: Admin role name who's needed to admin commands. User will need to have a role with this name to allow execution.
- `options`: Options that you want to add on your bot. This property is just a copy of `Discord.CLientOptions` class.

## Commands
Your commands must follow a specific pattern. The file will have to be a module exported, with differents arguments. Basically, a new command without slash command and aliases should be like that :
```ts
import { Message } from "discord.js";
import { Bot } from "../Bot";
import EmbedMessage from "../Tools/EmbedMessage";

module.exports = {
  name: '',
  description: '',
  usage: '',
  slashCommand: {
    enabled: false,
    options: []
  },
  admin: false,
  alias: [],

  async execute(client: Bot, message: Message, args: string[]){
  }
}
```