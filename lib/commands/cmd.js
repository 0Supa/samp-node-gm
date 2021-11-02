const colors = require('../colors.json')
const { gm, samp } = require("../index");

module.exports = {
    name: 'cmd',
    aliases: ['command'],
    usage: '<load/unload/reload> <command name>',
    execute(reply, playerid, args) {
        if (!samp.IsPlayerAdmin(playerid)) return reply.error("You need to be an Admin to use this command")

        if (args.length < 2) return reply.usage(`/${this.name} ${this.usage}`)

        const option = args[0].toLowerCase()
        const commandName = args[1].toLowerCase();
        const command = gm.commands[commandName]
            || Object.values(gm.commands).find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

        try {
            switch (option) {
                case "load": {
                    if (command) return reply.send(`Command ${colors.wheat}${commandName}${colors.white} is already loaded`)

                    const commandFile = require(`./${commandName}.js`);
                    gm.commands[commandName] = commandFile;
                    return reply.send(`Command ${colors.wheat}${commandName}${colors.white} has been loaded`)
                }
                case "unload": {
                    if (!command) return reply.error(`Couldn't find a command named ${colors.wheat}${commandName}`)

                    delete require.cache[require.resolve(`./${command.name}.js`)]
                    delete gm.commands[command.name];
                    return reply.send(`Command ${colors.wheat}${commandName}${colors.white} has been unloaded`)
                }
                case "reload": {
                    if (!command) return reply.error(`Couldn't find a command named ${colors.wheat}${commandName}`)

                    delete require.cache[require.resolve(`./${command.name}.js`)]
                    const newCommand = require(`./${command.name}.js`);
                    gm.commands[newCommand.name] = newCommand;
                    return reply.send(`Command ${colors.wheat}${commandName}${colors.white} has been reloaded`)
                }
                default: {
                    reply.error("Invalid option")
                }
            }
        } catch (e) {
            console.error(e)
            return reply.error(e.message || "(unknown)")
        }
    },
};
