const { gm, samp } = require("./index");
const colors = require('./colors.json')

samp.OnGameModeInit(() => {
    console.log(`Node version: ${process.version}`)
    gm.init = new Date()
    samp.SetGameModeText(`Supa, ${gm.init.toDateString()} [${gm.init.getHours()}:${gm.init.getMinutes()}]`);

    samp.ShowNameTags(true)
    samp.SetNameTagDrawDistance(30)
    samp.EnableStuntBonusForAll(false)
    samp.LimitPlayerMarkerRadius(1.0)
    samp.DisableInteriorEnterExits()
    samp.AllowInteriorWeapons(true)
    samp.UsePlayerPedAnims()
    samp.AddPlayerClass(0, 2095.5671, 1433.1622, 10.8203, 92.4388, 0, 0, 0, 0, 0, 0);
    return true;
});

samp.OnPlayerConnect(({ playerid }) => {
    const name = samp.GetPlayerName(playerid, 24)
    samp.callNative("SendClientMessageToAll", "is", -1, `${name} ${colors.green}joined`);
    return true;
})

const reasons = ["crash/timeout", "quit", "banned/kicked"]
samp.OnPlayerDisconnect(({ playerid }, reasonId) => {
    const name = samp.GetPlayerName(playerid, 24)
    samp.callNative("SendClientMessageToAll", "is", -1, `${name} ${colors.red}left${colors.white} ${colors.gray}(${reasons[reasonId]})`);
    return true;
})

samp.OnPlayerCommandText(({ playerid }, text) => {
    const args = text.split(/ +/)
    const commandName = args.shift().substring(1).toLowerCase()
    const command = gm.commands[commandName]
        || Object.values(gm.commands).find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

    if (!command) return

    const reply = {
        send: function (text) {
            samp.callNative('SendClientMessage', 'iis', playerid, -1, text);
        },
        usage: function (text) {
            this.send(`${colors.cyan}Usage${colors.white}: ${text}`)
        },
        error: function (text) {
            this.send(`${colors.red}Error${colors.white}: ${text}`)
        }
    }

    try {
        command.execute(reply, playerid, args)
    } catch (err) {
        console.log(err)
        reply.error('The command execution resulted in an error :(')
    }
    return true;
})
