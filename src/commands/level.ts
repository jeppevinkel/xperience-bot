import {SlashCommandBuilder} from '@discordjs/builders'
import {CommandInteraction, Guild, GuildMember, MessageAttachment} from 'discord.js'
import Command from '../models/command'
import {Canvas, createCanvas, loadImage} from 'canvas'
import {circlePath, ColorPalette, drawProgressBar, fillRoundedRect, roundedRectanglePath} from '../utils/canvasHelpers'
import Level from "../models/level";

export const data = new SlashCommandBuilder()
    .setName('level')
    .setDescription('View yours or another member\'s level')
    .addUserOption(option => {
        return option
            .setName('member')
            .setDescription('Member to view level of')
            .setRequired(false)
    })

export const admin = false

export async function execute(interaction : CommandInteraction) {
    const user = interaction.options.getUser('member', false) ?? interaction.user

    const key = `${interaction.guild.id}-${user.id}`

    const userData = interaction.client.levels.ensure(key, {
        user: interaction.user.id,
        guild: interaction.guild.id,
        xp: 0,
        level: 0,
        lastMessage: 0
    })

    const levels = interaction.client.settings.get(interaction.guild.id, 'levels') as Level[]
    const nextLevel = levels.find((l, i) => i == userData.level)

    const canvas = createCanvas(800, 200)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = ColorPalette.background
    fillRoundedRect(ctx, 0, 0, canvas.width, canvas.height, 20)

    ctx.save()
    circlePath(ctx, 75, 75, 65)
    ctx.clip()
    const avatar = await loadImage(user.displayAvatarURL({format: 'jpg'}))
    ctx.drawImage(avatar, 10, 10, 130, 130)
    ctx.restore()

    ctx.font = '40px sans-serif'
    ctx.fillStyle = ColorPalette.red
    ctx.fillText(user.username + '#' + user.discriminator, 160, 60)

    const allUsers = interaction.client.levels.fetchEverything().array().sort((a, b) => {
        return b.xp - a.xp
    })
    let rank = allUsers.findIndex((u) => u.user == userData.user) + 1

    if (nextLevel != undefined) {
        ctx.font = '30px sans-serif'
        ctx.fillText(`Level: ${userData.level}    XP: ${userData.xp}/${nextLevel.xp}    Rank: ${rank}`, 160, 120)

        drawProgressBar(ctx, (userData.xp / nextLevel.xp) * 100)
    } else {
        ctx.font = '30px sans-serif'
        ctx.fillText(`Level: ${userData.level}    XP: ${userData.xp}    Rank: ${rank}`, 160, 120)

        drawProgressBar(ctx, 100)
    }

    const attachment = new MessageAttachment(canvas.toBuffer(), `${user.toString()}-level.png`)

    await interaction.reply({files: [attachment]})
}