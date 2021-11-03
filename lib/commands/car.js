const colors = require('../colors.json')
const { samp } = require("../index");

module.exports = {
    name: 'car',
    aliases: ['veh', 'spawncar', 'v'],
    usage: '<Vehicle ID>',
    description: "Spawn a vehicle",
    execute(reply, { playerid }, args) {
        const model = args[0]
        if (isNaN(model)) return reply.usage(`/${this.name} ${this.usage}`)

        if (model < 400 || model > 611) return reply.error("Invalid Vehicle ID (400 - 611)");

        const playerPos = samp.GetPlayerPos(playerid)

        const carId = samp.CreateVehicle(model, playerPos[0], playerPos[1], playerPos[2], 0.0, -1, -1, -1);

        samp.SetVehicleNumberPlate(carId, samp.GetPlayerName(playerid, 24));
        samp.LinkVehicleToInterior(carId, samp.GetPlayerInterior(playerid));
        samp.SetVehicleVirtualWorld(carId, samp.GetPlayerVirtualWorld(playerid));
        samp.PutPlayerInVehicle(playerid, carId, 0)
        const vehicleName = samp.GetVehicleName(carId)
        reply.send(`Successfully spawned ${colors.wheat}${vehicleName}`)
    },
};
