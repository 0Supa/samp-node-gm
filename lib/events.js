const { gm, samp, query } = require("./index");
const colors = require('./colors.json');
const bcrypt = require('bcryptjs');
const loggedUsers = new Set();
const cooldown = require('./cooldown')

const saltRounds = 10;

const dialogs = {
    register: {
        id: 1,
        show: (playerid) => samp.ShowPlayerDialog(playerid, dialogs.register.id, samp.DIALOG_STYLE.PASSWORD, "Create an account", "Enter a password below:", "Register", "Quit")
    },
    login: {
        id: 2,
        show: (playerid) => samp.ShowPlayerDialog(playerid, dialogs.login.id, samp.DIALOG_STYLE.PASSWORD, "Enter your account", "Enter your password below:", "Login", "Quit")
    },
    confirmRegister: {
        id: 3,
        show: (playerid) => samp.ShowPlayerDialog(playerid, dialogs.confirmRegister.id, samp.DIALOG_STYLE.PASSWORD, "Confirm your password", "Confirm your password below:", "Register", "Quit")
    }
}

function send(playerid, text) {
    samp.callNative('SendClientMessage', 'iis', playerid, -1, text);
}

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
    samp.AddPlayerClass(0, gm.playerSpawn.x, gm.playerSpawn.y, gm.playerSpawn.z, gm.playerSpawn.rotation, 0, 0, 0, 0, 0, 0)
    return true;
});

samp.OnPlayerConnect(({ playerid }) => {
    samp.TogglePlayerSpectating(playerid, 1)
    const name = samp.GetPlayerName(playerid, 24)
    samp.callNative("SendClientMessageToAll", "is", -1, `${name} ${colors.green}joined`);

    (async () => {
        const data = await query(`SELECT COUNT(1) AS \`exists\` FROM users WHERE username=?`, [samp.GetPlayerName(playerid, 24)])

        if (data[0].exists) dialogs.login.show(playerid);
        else dialogs.register.show(playerid);
    })();

    return true;
})

const reasons = ["crash/timeout", "quit", "banned/kicked"]
samp.OnPlayerDisconnect(({ playerid }, reasonId) => {
    loggedUsers.delete(playerid)
    const name = samp.GetPlayerName(playerid, 24)
    samp.callNative("SendClientMessageToAll", "is", -1, `${name} ${colors.red}left${colors.white} ${colors.gray}(${reasons[reasonId]})`);
    return true;
})

samp.OnPlayerSpawn((player) => {
    const { playerid } = player

    if (!loggedUsers.has(playerid)) {
        samp.Kick(playerid)
        return true;
    }

    samp.SetPlayerSkin(playerid, player.skin)
    return true;
})

samp.OnPlayerCommandText((player, text) => {
    const { playerid } = player
    const args = text.split(/ +/)
    const commandName = args.shift().substring(1).toLowerCase()
    const command = gm.commands[commandName]
        || Object.values(gm.commands).find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

    if (!command) return

    const reply = {
        send: function (text) {
            send(playerid, text)
        },
        usage: function (text) {
            this.send(`${colors.cyan}Usage${colors.white}: ${text}`)
        },
        error: function (text) {
            this.send(`${colors.red}Error${colors.white}: ${text}`)
        }
    }

    if (cooldown.has(`${playerid}-${command.name}`)) {
        reply.send(`${colors.gray}You are on cooldown`)
        return true;
    }
    if (command.cooldown) cooldown.set(`${playerid}-${command.name}`, command.cooldown * 1000);

    (async () => {
        try {
            await command.execute(reply, player, args)
        } catch (err) {
            console.log(err)
            reply.error('The command execution resulted in an error :(')
        }
    })();
    return true;
})

async function initPlayer(player) {
    const { playerid } = player

    loggedUsers.add(playerid)
    const { skin } = (await query(`SELECT skin FROM users WHERE username=? LIMIT 1`, [samp.GetPlayerName(playerid, 24)]))[0]
    player.skin = skin
    samp.TogglePlayerSpectating(playerid, 0)
    samp.GameTextForPlayer(playerid, "~g~SPAWNING...", 1000, 3)
    setTimeout(samp.SpawnPlayer, 1000, playerid)
}

samp.OnDialogResponse((player, dialogid, response, listitem, input) => {
    const { playerid } = player

    if (response === 0) { // Quit
        send(playerid, `${colors.wheat}Goodbye!`)
        setTimeout(samp.Kick, 1000, playerid);
        return true;
    }

    if (dialogid === dialogs.register.id) {
        if (!/^(?:(?:(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]))|(?:(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[]:;<>,.?\/~_+-=|\]))|(?:(?=.*[0-9])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[]:;<>,.?\/~_+-=|\]))|(?:(?=.*[0-9])(?=.*[a-z])(?=.*[*.!@$%^&(){}[]:;<>,.?\/~_+-=|\]))).{8,32}$/.test(input)) {
            send(playerid, `Your password needs to have at least 8 characters, and at least one digit and a uppercase & lowercase letter`)
            dialogs.register.show(playerid);
            return true;
        }

        (async () => {
            player.confirmPassword = await bcrypt.hash(input, saltRounds)
            dialogs.confirmRegister.show(playerid)
        })();
    }
    else if (dialogid === dialogs.confirmRegister.id) {
        const maxTries = 3
        if (!player.confirmTries) player.confirmTries = 0

        if (!input) {
            dialogs.confirmRegister.show(playerid);
            return true;
        }

        (async () => {
            const playerName = samp.GetPlayerName(playerid, 24)
            const password = player.confirmPassword

            const match = await bcrypt.compare(input, password)
            if (!match) {
                player.confirmTries++
                if (player.confirmTries === maxTries) {
                    send(playerid, `${colors.red}No more tries left`)
                    setTimeout(samp.Kick, 1000, playerid);
                    return;
                }

                send(playerid, `${colors.red}Incorrect password confirmation${colors.white}. You have ${colors.wheat}${maxTries - player.confirmTries}${colors.white} more tries`)
                dialogs.confirmRegister.show(playerid);
                return;
            }

            await query(`INSERT INTO users (username, password, register_ip) VALUES (?, ?, ?)`, [playerName, password, samp.GetPlayerIp(playerid, 15)])
            delete player.confirmPassword

            initPlayer(player)

            for (let clear = 0; clear < 50; clear++) { send(playerid, "") }
            send(playerid, `${colors.green}Successfully registered${colors.white}! Welcome ${colors.wheat}${playerName}`)
        })();
        return true;
    }
    else if (dialogid === dialogs.login.id) {
        const maxTries = 3
        if (!player.loginTries) player.loginTries = 0

        if (!input) {
            dialogs.login.show(playerid);
            return true;
        }

        (async () => {
            const playerName = samp.GetPlayerName(playerid, 24)
            const { password } = (await query(`SELECT password FROM users WHERE username=? LIMIT 1`, [playerName]))[0]

            const match = await bcrypt.compare(input, password)
            if (!match) {
                player.loginTries++
                if (player.loginTries === maxTries) {
                    send(playerid, `${colors.red}No more tries left${colors.white}. Good luck next time ;)`)
                    setTimeout(samp.Kick, 1000, playerid);
                    return;
                }

                send(playerid, `${colors.red}Incorrect password${colors.white}. You have ${colors.wheat}${maxTries - player.loginTries}${colors.white} more tries`)
                dialogs.login.show(playerid);
                return;
            }

            initPlayer(player)

            for (let clear = 0; clear < 50; clear++) { send(playerid, "") }
            send(playerid, `${colors.green}Successfully logged in${colors.white}! Hi ${colors.wheat}${playerName}`)
        })();
        return true;
    }
})
