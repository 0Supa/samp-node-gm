const colors = require('../colors.json')
const { samp } = require("../index");

module.exports = {
    name: 'hp',
    aliases: ['health'],
    usage: '<Health>',
    description: "Set your health",
    execute(reply, playerid, args) {
        const health = args[0]
        if (isNaN(health)) return reply.usage(`/${this.name} ${this.usage}`)

        samp.SetPlayerHealth(playerid, health)
        reply.send(`Successfully set your health to ${colors.wheat}${health}`)
    },
};
