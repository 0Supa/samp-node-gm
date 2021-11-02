const colors = require('../colors.json')
const { samp } = require("../index");

module.exports = {
    name: 'gun',
    aliases: ['weap', 'givegun'],
    usage: '<Weapon ID> <Ammo>',
    description: "Give yourself a weapon",
    execute(reply, playerid, args) {
        const gunId = args[0]
        const ammo = args[1] || 1000
        if (isNaN(gunId) || isNaN(ammo)) return reply.usage(`/${this.name} ${this.usage}`)

        if (gunId < 0 || gunId > 46) return reply.error("Invalid Weapon ID (0 - 46)");

        samp.GivePlayerWeapon(playerid, gunId, ammo)
        const gunName = samp.GetWeaponName(gunId, 32)
        reply.send(`Successfully gave you ${colors.wheat}${gunName}${colors.white} with ${colors.wheat}x${ammo}${colors.white} ammo`)
    },
};
