import {Message, TextChannel} from "discord.js";
import {GetCommands} from "../utils/deployCommands";
import {randomInt} from "crypto";
import Level from "../models/level";

export const name = 'messageCreate'
export const once = false
export async function execute(message : Message) {
    if (message.author.bot || message.guild == null || (message.client.settings.get(message.guild.id, 'excludedChannels') as Array<string>).includes(message.channel.id) || message.member.roles.cache.hasAny(...(message.client.settings.get(message.guild.id, 'excludedRoles') as Array<string>))) return

    const wordCount = message.content.split(' ').length

    const key = `${message.guild.id}-${message.author.id}`

    const userData = message.client.levels.ensure(key, {
        user: message.author.id,
        guild: message.guild.id,
        xp: 0,
        level: 0,
        lastMessage: 0
    })
    const secondsSinceLast = (Date.now() - userData.lastMessage)/1000


    if (secondsSinceLast > message.client.settings.get(message.guild.id, 'messageCooldown')) {
        const settings = message.client.settings.get(message.guild.id)
        let xpGain = randomInt(settings.minXp, settings.maxXp + 1)

        // message.client.levels.set(key, userData.xp + xpGain, 'xp')

        userData.xp += xpGain
        userData.lastMessage = Date.now()

        const levels = message.client.settings.get(message.guild.id, 'levels') as Array<Level>
        const slicedLevels = levels.slice(userData.level, levels.length)
        let nextLevel: number

        for (let i = 0; i < slicedLevels.length; i++) {
            console.log('Checking level:', slicedLevels[i])
            if (userData.xp >= slicedLevels[i].xp) {
                userData.level++

                if (slicedLevels[i].role != null) {
                    const newRole = message.guild.roles.cache.get(slicedLevels[i].role) ?? await message.guild.roles.fetch(slicedLevels[i].role)

                    try {
                        await message.member.roles.add(newRole)
                    } catch (err) {
                        console.log(`[Add role (${newRole.name})]`, err)
                    }
                }
                if (settings.levelAlerts.enabled) {
                    const alertChannel = message.guild.channels.cache.get(settings.levelAlerts.alertChannel) as TextChannel ?? await message.guild.channels.fetch(settings.levelAlerts.alertChannel) as TextChannel

                    try {
                        await alertChannel.send(settings.levelAlerts.alertMessage.replace(/{displayName}/g, message.member.toString()).replace(/{level}/g, userData.level))
                    } catch (err) {
                        console.log(`[Send message (${alertChannel.name})]`, err)
                    }
                }

                console.log('You levelled up to ', userData.level)
            } else {
                console.log('Not enough XP. Stopping level checks.')
                break
            }
        }

        message.client.levels.set(key, userData)
    }
    console.log(userData, 'WordCount:', wordCount)
}