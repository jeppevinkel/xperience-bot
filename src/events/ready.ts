import {Client} from 'discord.js'
import {RegisterCommandsForAllGuilds} from '../utils/deployCommands'

export const name = 'ready'
export const once = true
export function execute(client : Client) {
    console.log('Ready!')

    RegisterCommandsForAllGuilds(client)
}