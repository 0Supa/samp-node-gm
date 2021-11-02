const colors = require('../colors.json')
const { samp } = require("../index");

module.exports = {
    name: 'skin',
    aliases: ['setskin'],
    usage: '<Skin ID>',
    description: "Change your skin",
    execute(reply, playerid, args) {
        const skinId = args[0]
        if (isNaN(skinId)) return reply.usage(`/${this.name} ${this.usage}`)

        if (skinId < 0 || skinId > 311) return reply.error("Invalid Weapon ID (0 - 311)");

        samp.SetPlayerSkin(playerid, skinId)
        reply.send(`Successfully changed your skin to ${colors.wheat}${skinId}`)
    },
};
