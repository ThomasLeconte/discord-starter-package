import { Bot } from './Bot';
const config = require('./config.json');

class Test {
  toto: string
  tata: string

  constructor(){}
}

const client: Bot = new Bot(config["environments"][config.env]);
console.log(`${client.name()} is starting on ${config.env} environment...`);

client.on('ready', () => { console.log(`${new Date().toLocaleString()} - Started ${client.user.tag} !`)});
client.on('error', err => console.error(err));
process.on('exit', () => { console.log(`${new Date().toLocaleString()} - Stopped ${client.user.tag} !`)});
