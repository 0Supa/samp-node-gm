const { samp } = require("../index");
const { wheat } = require('../colors.json');

module.exports = {
    name: 'ping',
    aliases: ['pong'],
    execute(reply, playerid, args) {
        const ping = samp.GetPlayerPing(playerid)

        reply.send(`Pong! Your ping is: ${wheat}${ping}ms `)
    },
};
