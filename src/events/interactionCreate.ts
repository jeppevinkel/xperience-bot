import {ChatInputCommandInteraction, Interaction} from 'discord.js'
import {GetCommands} from "../utils/deployCommands";

export const name = 'interactionCreate'
export const once = false
export async function execute(interaction : Interaction) {
    if (interaction.isChatInputCommand()) {
        const cmdInter = interaction as ChatInputCommandInteraction

        const cmd = GetCommands().get(interaction.commandName)

        if (!cmd) return

        try {
            await cmd.execute(cmdInter)
        } catch (err) {
            console.error('[interactionCreate]', err)
            await cmdInter.reply({
                content: 'There was an error while executing the command',
                ephemeral: true
            })
        }
    }
}