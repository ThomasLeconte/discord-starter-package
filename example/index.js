const { init } = require('discord-starter-package')
const dotenv = require('dotenv')

//Read .env file containing the bot token
// It is recommended to use a .env file to store the bot token
dotenv.config()

//Create a new bot instance
const bot = init({
  token: process.env.BOT_TOKEN, //Bot token provided by dotenv
  prefix: '!', //Bot prefix
  name: 'Example Bot', //Bot name
  autoLog: true,
  options: { "intents": ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"] }
})