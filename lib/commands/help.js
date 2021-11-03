const { gm } = require("../index");
const colors = require('../colors.json');

module.exports = {
    name: 'help',
    aliases: ['cmds', 'cmdhelp', 'commands'],
    execute(reply, { playerid }, args) {
        const commands = ['car', 'gun', 'hp', 'skin', 'addnos']
        reply.send(`${colors.gray}--- Command list`)
        for (const commandName of commands) {
            const command = gm.commands[commandName]

            let usage = ' '
            if (command.usage) usage = ` ${colors.wheat}${command.usage} `

            reply.send(`${colors.cyan}/${command.name}${usage}${colors.white}- ${command.description}`)
        }
        reply.send(`${colors.gray}---`)
    },
};
