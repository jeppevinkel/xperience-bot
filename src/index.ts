import Enmap from 'enmap'
import fs from 'fs'
import dotenv from 'dotenv'
const weightedRandom = require('weighted-random')

import {Client, CommandInteraction, Intents, Interaction, Snowflake, SnowflakeUtil} from 'discord.js'
import { RegisterCommandsForAllGuilds, RegisterCommandsForGuild, UpdatePermissionsForGuild } from './utils/deployCommands'
import Command from './models/command'
import Event from './models/event'
import Level from './models/level'
// import DiscordClient from "./models/discordClient";

dotenv.config()

if (process.env.DISCORD_TOKEN == undefined || process.env.DISCORD_TOKEN == "") {
    console.error("Please set a DISCORD_TOKEN in the .env file")
    process.exit()
}

let levels = [
    {
        role: "sdgf645sgs",
        xp: 200
    },
    {
        role: "34r325435",
        xp: 400
    },
    {
        role: "2325gs",
        xp: 150
    },
    {
        role: "gdsgsd",
        xp: 900
    }
]

levels = levels.sort((a, b) => a.xp - b.xp)

let curLevel = 1
let curXp = 160


let slicedLevels = levels.slice(curLevel, levels.length)

// console.log('Sliced', slicedLevels)

for (let i = 0; i < slicedLevels.length; i++) {
    console.log('Checking level:', slicedLevels[i])
    if (curXp > slicedLevels[i].xp) {
        curLevel++
        console.log('You levelled up to ', curLevel)
    } else {
        console.log('Not enough XP. Stopping level checks.')
        break
    }
}

// process.exit()

// const max : number = 8
// const min : number = 1
// const length : number = max - min + 1
// const wordCount = 16
//
// const longSentence : boolean = wordCount > 15
//
// let longChoices = new Array<number>(length)
// longChoices.fill(1)
//
// let mediumChoices = new Array<number>(length)
// mediumChoices.fill(1)
//
// let shortChoices = new Array<number>(length)
// shortChoices.fill(1)
//
// for (let i = 0; i < longChoices.length; i++) {
//     console.log(i, ((i + Math.round(longChoices.length/2)) % longChoices.length))
//     longChoices[i] += i * 0.1
//     shortChoices[longChoices.length - 1 - i] += i * 0.1
// }
//
// const mediumMiddle = Math.floor(mediumChoices.length/2)
// for (let i = 0; i <= mediumMiddle; i++) {
//     mediumChoices[i] += i * 0.1
//     mediumChoices[mediumChoices.length - 1 - i] += i * 0.1
// }
// console.log(mediumChoices)
//
// const N = 100
//
// let longChosen = new Array<number>(N)
// let mediumChosen = new Array<number>(N)
// let shortChosen = new Array<number>(N)
//
// for (let i = 0; i < N; i++) {
//     longChosen[i] = weightedRandom(longChoices)
//     mediumChosen[i] = weightedRandom(mediumChoices)
//     shortChosen[i] = weightedRandom(shortChoices)
// }
//
// console.log('LongChoices', longChoices)
// console.log('MediumChoices', mediumChoices)
// console.log('ShortChoices', shortChoices)
// console.log('LongChosen', longChosen)
// console.log('MediumChosen', mediumChosen)
// console.log('ShortChosen', shortChosen)
//
// process.exit()

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]})

client.settings = new Enmap({
    name: 'settings',
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep',
    autoEnsure: {
        excludedChannels: Array<Snowflake>(),
        excludedRoles: Array<Snowflake>(),
        levels: Array<Level>(),
        maxXp: 1,
        minXp: 1,
        messageCooldown: 60,
        levelAlerts: {
            enabled: false,
            alertChannel: '',
            alertMessage: '{displayName} has reached level **{level}**!'
        },
        leaderboard: {
            enabled: true,
            adminOnly: false
        }
    }
})

client.levels = new Enmap({
    name: 'levels',
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep'
})

client.on('roleUpdate', x => {
    UpdatePermissionsForGuild(x.guild)
        .catch(err => {
            console.error('[roleUpdate]', err)
        })
})
client.on('roleCreate', x => {
    UpdatePermissionsForGuild(x.guild)
        .catch(err => {
            console.error('[roleCreate]', err)
        })
})
client.on('roleDelete', x => {
    UpdatePermissionsForGuild(x.guild)
        .catch(err => {
            console.error('[roleDelete]', err)
        })
})
client.on('guildCreate', guild => {
    RegisterCommandsForGuild(guild)
        .catch(err => {
            console.error('[guildCreate]', err)
        })
})
client.on('guildDelete', guild => {
    client.settings.delete(guild.id)
})

function RegisterEvents() {
    const files = fs.readdirSync(`${__dirname}/events`).filter(file => file.endsWith('.js'))

    for (const file of files) {
        const event = require(`${__dirname}/events/${file}`) as Event
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

RegisterEvents()

client.login(process.env.DISCORD_TOKEN).catch()