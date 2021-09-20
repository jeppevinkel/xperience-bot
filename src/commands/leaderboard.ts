import {SlashCommandBuilder} from '@discordjs/builders'
import {CommandInteraction, GuildMember, MessageAttachment} from 'discord.js'
import Command from '../models/command'
import {Canvas, createCanvas, loadImage, registerFont} from 'canvas'
import {circlePath, ColorPalette, drawProgressBar, fillRoundedRect, roundedRectanglePath} from '../utils/canvasHelpers'
import Level from "../models/level";
registerFont('fonts/TitilliumWeb-Regular.ttf', {family: 'Titillium Web'})

export const data = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the top 10 users of the guild')
    .addBooleanOption(option => {
        return option
            .setName('me')
            .setDescription('Center leaderboard on your position')
            .setRequired(false)
    })

export const admin = false

export async function execute(interaction : CommandInteraction) {
    if (interaction.member instanceof GuildMember) {
        const me = interaction.options.getBoolean('me', false) ?? false

        let users: any[]

        if (me) {
            const filtered = interaction.client.levels.fetchEverything().filter( l => l.guild === interaction.guild.id ).array();
            users = filtered.sort((a, b) => {
                return b.xp - a.xp
            })
            const myIndex = users.findIndex(u => u.user == interaction.user.id)

            if (myIndex == -1) {
                users = users.slice(0, Math.min(10, users.length))
            } else {
                const startIndex = Math.max(0, myIndex - 4)
                const endIndex = Math.min(startIndex + 10, users.length)
                users = users.slice(startIndex, endIndex)
            }

            users = users.slice(0, Math.min(10, users.length))
        } else {
            const filtered = interaction.client.levels.fetchEverything().filter( l => l.guild === interaction.guild.id ).array();
            users = filtered.sort((a, b) => {
                return b.xp - a.xp
            })
            users = users.slice(0, Math.min(10, users.length))
        }

        const entryHeight = 80
        const entryPadding = 10

        const totalHeight = (entryHeight + entryPadding) * users.length + entryPadding

        const canvas = createCanvas(800, users.length == 0 ? 100 : totalHeight)
        const ctx = canvas.getContext('2d')

        if (users.length == 0) {
            ctx.fillStyle = ColorPalette.background
            fillRoundedRect(ctx, 0, 0, canvas.width, canvas.height, 20)

            ctx.font = '40px Titillium Web'
            ctx.fillStyle = ColorPalette.red
            ctx.fillText("No one has talked yet ya dingus", 20, (canvas.height/2) + (40/2))

            const attachment = new MessageAttachment(canvas.toBuffer(), `${interaction.guild.toString()}-leaderboard.png`)

            await interaction.reply({files: [attachment]})
            return
        }

        ctx.fillStyle = ColorPalette.background
        fillRoundedRect(ctx, 0, 0, canvas.width, canvas.height, 20)

        for (let i = 0; i < users.length; i++) {
            const x = entryPadding
            const y = entryPadding + i * (entryHeight + entryPadding)
            const user = interaction.client.users.cache.get(users[i].user) ?? await interaction.client.users.fetch(users[i].user)

            ctx.save()
            roundedRectanglePath(ctx, x, y, entryHeight, entryHeight, 20)
            ctx.clip()
            const avatar = await loadImage(user.displayAvatarURL({format: 'jpg'}))
            ctx.drawImage(avatar, x, y, entryHeight, entryHeight)
            ctx.restore()

            const fontSize = entryHeight/2
            ctx.font = `${fontSize}px Titillium Web`
            ctx.fillStyle = getRankCol(i)
            const rankText = `#${i+1}`
            const rankTextMeasure = ctx.measureText(rankText)
            const rankTextX = x + entryHeight + entryPadding
            ctx.fillText(rankText, rankTextX, y + (entryHeight/2) + (fontSize/2))

            ctx.fillStyle = '#626262'
            const separatorText = '•'
            const separatorTextMeasure = ctx.measureText(separatorText)
            const separatorTextX = rankTextX + rankTextMeasure.width + entryPadding
            ctx.fillText(separatorText, separatorTextX, y + (entryHeight/2) + (fontSize/2))

            ctx.fillStyle = ColorPalette.red
            const nameText = `${user.username}#${user.discriminator}`
            const nameTextMeasure = ctx.measureText(nameText)
            const nameTextX = separatorTextX + separatorTextMeasure.width + entryPadding
            ctx.fillText(nameText, nameTextX, y + (entryHeight/2) + (fontSize/2))

            ctx.fillStyle = '#626262'
            ctx.fillText(separatorText, nameTextX + nameTextMeasure.width + entryPadding, y + (entryHeight/2) + (fontSize/2))

            ctx.fillStyle = ColorPalette.red
            const levelText = `Level: ${users[i].level}`
            const levelTextMeasure = ctx.measureText(levelText)
            const levelTextX = nameTextX + nameTextMeasure.width + entryPadding + separatorTextMeasure.width + entryPadding
            ctx.fillText(levelText, levelTextX, y + (entryHeight/2) + (fontSize/2))
        }

        // const userData = interaction.client.levels.ensure(key, {
        //     user: interaction.user.id,
        //     guild: interaction.guild.id,
        //     xp: 0,
        //     level: 0,
        //     lastMessage: 0
        // })
        //
        // const levels = interaction.client.settings.get(interaction.guild.id, 'levels') as Level[]
        // const nextLevel = levels.find(l => l.number = userData.level + 1)
        //
        // const canvas = createCanvas(800, 200)
        // const ctx = canvas.getContext('2d')
        //
        // ctx.fillStyle = ColorPalette.background
        // fillRoundedRect(ctx, 0, 0, canvas.width, canvas.height, 20)
        //
        // ctx.save()
        // circlePath(ctx, 75, 75, 65)
        // ctx.clip()
        // const avatar = await loadImage(interaction.user.displayAvatarURL({format: 'jpg'}))
        // ctx.drawImage(avatar, 10, 10, 130, 130)
        // ctx.restore()
        //
        // ctx.font = '40px sans-serif'
        // ctx.fillStyle = ColorPalette.red
        // ctx.fillText(interaction.user.username + '#' + interaction.user.discriminator, 160, 60)
        //
        // ctx.font = '30px sans-serif'
        // ctx.fillText(`Level: ${userData.level}    XP: ${userData.xp}`, 160, 120)
        //
        // if (nextLevel != undefined) {
        //     drawProgressBar(ctx, (userData.xp/nextLevel.xp) * 100)
        // } else {
        //     drawProgressBar(ctx, 100)
        // }
        //
        // const attachment = new MessageAttachment(canvas.toBuffer(), `${interaction.member.toString()}-level.png`)

        const attachment = new MessageAttachment(canvas.toBuffer(), `${interaction.guild.toString()}-leaderboard.png`)

        await interaction.reply({files: [attachment]})
    }
}

function getRankCol(index: number) {
    switch (index) {
        case 0:
            return '#fffb00'
        case 1:
            return '#939393'
        case 2:
            return '#9d5600'
        default:
            return '#ffffff'
    }
}