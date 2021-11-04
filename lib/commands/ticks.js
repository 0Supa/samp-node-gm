const { samp } = require("../index");
const { wheat } = require('../colors.json');

module.exports = {
    name: 'tickrate',
    aliases: ['tick', 'ticks'],
    description: "Get Server Tickrate",
    execute(reply, { playerid }, args) {
        reply.send(`Current Server Tickrate: ${wheat}${samp.GetServerTickRate()}`)
    },
};
