import fs from 'node:fs';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import path from 'path/posix';
import { ICommandCollectionClient } from './interfaces/ICommandCollectionClient';
import { logger } from './util/logger';

const log = logger('Startup');

//Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS ] });
const client: ICommandCollectionClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ]
});

client.commands = new Collection();

log.debug('Loading commands');
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    for (const file of fs
        .readdirSync(`./commands/${folder}`)
        .filter((file) => file.endsWith('.js'))) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.default.data.name, command.default);
    }
}
log.debug('Finished loading commands');

log.debug('Loading events');
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith('.js'));
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const { default: event } = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
log.debug('Finished loading events');

process.on('unhandledRejection', (error) => {
    if (error instanceof Error) {
        log.error(error.message);
    } else {
        log.error(error);
    }
});

(async () => client.login(process.env.DBOT_CLIENT_TOKEN))().catch((err) => {
    if (err instanceof Error) {
        log.error(err.stack);
    } else {
        log.error(err);
    }
});
