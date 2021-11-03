const { samp } = require("../index");

module.exports = {
    name: 'addnos',
    aliases: ['nos',],
    description: "Add nos to a vehicle",
    execute(reply, { playerid }, args) {
        if (!samp.IsPlayerInAnyVehicle(playerid)) return reply.error("You need to be in a vehicle")

        samp.AddVehicleComponent(samp.GetPlayerVehicleID(playerid), 1010)
        reply.send(`Successfully added nos`)
    },
};
