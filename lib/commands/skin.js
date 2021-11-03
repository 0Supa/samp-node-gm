const colors = require('../colors.json')
const { samp, query } = require("../index");

module.exports = {
    name: 'skin',
    aliases: ['setskin'],
    usage: '<Skin ID>',
    cooldown: 4,
    description: "Change your skin",
    async execute(reply, player, args) {
        const { playerid } = player
        const skinId = args[0]
        if (isNaN(skinId)) return reply.usage(`/${this.name} ${this.usage}`)

        if (skinId < 0 || skinId > 311) return reply.error("Invalid Skin ID (0 - 311)");

        samp.SetPlayerSkin(playerid, skinId)
        player.skin = skinId
        await query("UPDATE users SET skin=? WHERE username=?", [skinId, samp.GetPlayerName(playerid, 24)])
        reply.send(`Successfully changed your skin to ${colors.wheat}${skinId}`)
    },
};
