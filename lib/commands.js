let { gm } = require('./index')
gm.commands = {};
const fs = require('fs');

const commandFiles = fs.readdirSync('./lib/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    gm.commands[command.name] = command
}
