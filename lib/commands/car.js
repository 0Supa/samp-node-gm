const colors = require('../colors.json')
const { samp } = require("../index");

module.exports = {
    name: 'car',
    aliases: ['veh', 'spawncar'],
    usage: '<Vehicle ID>',
    execute(reply, playerid, args) {
        const model = args[0]
        if (isNaN(model)) return reply.usage(`/${this.name} ${this.usage}`)

        if (model < 400 || model > 611) return reply.error("Invalid Vehicle ID (400 - 611)");

        const playerPos = samp.GetPlayerPos(playerid)

        const carId = samp.CreateVehicle(model, playerPos[0] + 3, playerPos[1] + 3, playerPos[2] + 3, 0.0, -1, -1, -1);

        samp.SetVehicleNumberPlate(carId, "playerid");
        samp.LinkVehicleToInterior(carId, samp.GetPlayerInterior(playerid));
        samp.SetVehicleVirtualWorld(carId, samp.GetPlayerVirtualWorld(playerid));
        const vehicleName = samp.GetVehicleName(carId)
        reply.send(`Successfully spawned ${colors.wheat}${vehicleName}`)
    },
};
