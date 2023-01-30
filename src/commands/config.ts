import {ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, ChannelType} from 'discord.js'
import Level from "../models/level";
// import {ChannelType} from "discord-api-types";

export const data = new SlashCommandBuilder()
    .setName('config')
    .setDescription('View/edit the guild config')
    .addSubcommand(option => {
        return option
            .setName('show')
            .setDescription('Show the current guild config')
    })
    .addSubcommandGroup(option => {
        return option
            .setName('excluded-channels')
            .setDescription('Manage excluded channels')
            .addSubcommand(option => {
                return option
                    .setName('add')
                    .setDescription('Exclude a channel from gaining XP')
                    .addChannelOption(option => {
                        return option
                            .setName('channel')
                            .setDescription('The channel to exclude')
                            .setRequired(true)
                    })
            })
            .addSubcommand(option => {
                return option
                    .setName('remove')
                    .setDescription('Stop a channel from being excluded from gaining XP')
                    .addChannelOption(option => {
                        return option
                            .setName('channel')
                            .setDescription('The channel to include')
                            .setRequired(true)
                    })
            })
    })
    .addSubcommandGroup(option => {
        return option
            .setName('excluded-roles')
            .setDescription('Manage excluded roles')
            .addSubcommand(option => {
                return option
                    .setName('add')
                    .setDescription('Exclude a role from gaining XP')
                    .addRoleOption(option => {
                        return option
                            .setName('role')
                            .setDescription('The role to exclude')
                            .setRequired(true)
                    })
            })
            .addSubcommand(option => {
                return option
                    .setName('remove')
                    .setDescription('Include a role in gaining XP')
                    .addRoleOption(option => {
                        return option
                            .setName('role')
                            .setDescription('The role to include')
                            .setRequired(true)
                    })
            })
    })
    .addSubcommandGroup(option => {
        return option
            .setName('xp')
            .setDescription('Settings related to max and min XP gain per message')
            .addSubcommand(option => {
                return option
                    .setName('max')
                    .setDescription('Show or change max XP gain per message')
                    .addIntegerOption(option => {
                        return option
                            .setName('amount')
                            .setDescription('Max XP gain amount')
                    })
            })
            .addSubcommand(option => {
                return option
                    .setName('min')
                    .setDescription('Show or change min XP gain per message')
                    .addIntegerOption(option => {
                        return option
                            .setName('amount')
                            .setDescription('Min XP gain amount')
                    })
            })
    })
    .addSubcommandGroup(option => {
        return option
            .setName('levels')
            .setDescription('Settings related to levels')
            .addSubcommand(option => {
                return option
                    .setName('add')
                    .setDescription('Add a new level')
                    .addIntegerOption(option => {
                        return option
                            .setName('xp')
                            .setDescription('The amount of xp required to achieve the level')
                            .setRequired(true)
                    })
                    .addRoleOption(option => {
                        return option
                            .setName('role')
                            .setDescription('The role granted when achieving the level')
                            .setRequired(false)
                    })
            })
            .addSubcommand(option => {
                return option
                    .setName('remove')
                    .setDescription('Remove a level')
                    .addIntegerOption(option => {
                        return option
                            .setName('xp')
                            .setDescription('The xp of the level to remove')
                            .setRequired(true)
                    })
            })
            .addSubcommand(option => {
                return option
                    .setName('edit')
                    .setDescription('Edit a level')
                    .addIntegerOption(option => {
                        return option
                            .setName('number')
                            .setDescription('The number of the level to edit')
                            .setRequired(true)
                    })
                    .addIntegerOption(option => {
                        return option
                            .setName('new-number')
                            .setDescription('The new number for the level')
                            .setRequired(false)
                    })
                    .addIntegerOption(option => {
                        return option
                            .setName('xp')
                            .setDescription('The new xp requirement for the level')
                            .setRequired(false)
                    })
                    .addRoleOption(option => {
                        return option
                            .setName('role')
                            .setDescription('The new role for the level')
                            .setRequired(false)
                    })
            })
    })
    .addSubcommandGroup(option => {
        return option
            .setName('level-alert')
            .setDescription('Settings related to level up alerts')
            .addSubcommand(option => {
                return option
                    .setName('set')
                    .setDescription('Set the options')
                    .addBooleanOption(option => {
                        return option
                            .setName('enabled')
                            .setDescription('Enable/disable level up alerts')
                    })
                    .addChannelOption(option => {
                        return option
                            .setName('channel')
                            .setDescription('The channel where alerts are displayed')
                            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                    })
                    .addStringOption(option => {
                        return option
                            .setName('message')
                            .setDescription('The message to show in the alerts. {user}, {level}')
                    })
            })
    })
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export const admin = true

export async function execute(interaction : ChatInputCommandInteraction) {
    let config = interaction.client.settings.get(interaction.guild.id)

    const subCommandGroup = interaction.options.getSubcommandGroup(false)
    const subCommand = interaction.options.getSubcommand(true)
    console.log(subCommandGroup, subCommand)

    if (subCommandGroup != null) {
        switch (subCommandGroup) {
            case 'excluded-channels':
                const channel = interaction.options.getChannel('channel', true)
                if (channel.type != ChannelType.GuildText) await interaction.reply({content: 'You can only exclude text channels', ephemeral: true})
                if (subCommand == 'add') {
                    interaction.client.settings.push(interaction.guild.id, channel.id, 'excludedChannels')
                    await interaction.reply({content: `${channel.toString()} has been excluded from XP counting`, ephemeral: true})
                } else if (subCommand == 'remove') {
                    interaction.client.settings.remove(interaction.guild.id, channel.id, 'excludedChannels')
                    await interaction.reply({content: `${channel.toString()} has been included in XP counting`, ephemeral: true})
                }
                break
            case 'excluded-roles':
                const role = interaction.options.getRole('role', true)
                if (subCommand == 'add') {
                    interaction.client.settings.push(interaction.guild.id, role.id, 'excludedRoles')
                    await interaction.reply({content: `${role.toString()} has been excluded from XP counting`, ephemeral: true})
                } else if (subCommand == 'remove') {
                    interaction.client.settings.remove(interaction.guild.id, role.id, 'excludedRoles')
                    await interaction.reply({content: `${role.toString()} has been included in XP counting`, ephemeral: true})
                }
                break
            case 'xp':
                const amount = interaction.options.getInteger('amount', false)

                if (subCommand == 'max') {
                    if (amount == null) {
                        await interaction.reply({content: config.maxXp.toString(), ephemeral: true})
                    } else {
                        interaction.client.settings.set(interaction.guild.id, amount, 'maxXp')
                        await interaction.reply({content: `Maximum XP gain has been set to \`${amount}\``, ephemeral: true})
                    }
                } else if (subCommand == 'min') {
                    if (amount == null) {
                        await interaction.reply({content: config.minXp.toString(), ephemeral: true})
                    } else {
                        interaction.client.settings.set(interaction.guild.id, amount, 'minXp')
                        await interaction.reply({content: `Minimum XP gain has been set to \`${amount}\``, ephemeral: true})
                    }
                }
                break
            case 'levels':
                switch (subCommand) {
                    case 'add': {
                        const xp = interaction.options.getInteger('xp', true)
                        const role = interaction.options.getRole('role', false)
                        const levels = interaction.client.settings.get(interaction.guild.id, 'levels') as Level[]
                        if (levels.some(l => l.xp == xp)) {
                            await interaction.reply('A level with that XP amount already exists')
                            return
                        } else {
                            const newLevel = {
                                xp: xp,
                                role: role?.id
                            } as Level
                            // interaction.client.settings.push(interaction.guild.id, newLevel, 'levels')
                            let levelArray = (interaction.client.settings.get(interaction.guild.id, 'levels') as Array<Level>)
                            levelArray.push(newLevel)
                            levelArray.sort((a, b) => a.xp - b.xp)
                            interaction.client.settings.set(interaction.guild.id, levelArray, 'levels')
                            await interaction.reply(`The new level has been added\n\`\`\`json\n${JSON.stringify(newLevel, null, 4)}\n\`\`\``)
                            return
                        }
                    }
                    case 'remove': {
                        const xp = interaction.options.getInteger('xp', true)

                        const index = (interaction.client.settings.get(interaction.guild.id, 'levels') as Array<Level>).findIndex(l => l.xp == xp)

                        if (index != -1) {
                            interaction.client.settings.remove(interaction.guild.id, (val: Level) => val.xp == xp, 'levels')
                            await interaction.reply(`Level ${index+1} given at ${xp}XP has been removed`)
                            return
                        } else {
                            await interaction.reply(`No level is set at ${xp}XP`)
                            return
                        }
                    }
                    case 'edit': {
                        const newNumber = interaction.options.getInteger('new-number', false)
                        const xp = interaction.options.getInteger('xp', false)
                        const role = interaction.options.getRole('role', false)



                        if (xp) {
                            // interaction.client.levels.set(interaction.guild.id, xp, 'levels')
                        }

                        // await interaction.reply(`The level has been edited\n\`\`\`json\n${JSON.stringify(newLevel, null, 4)}\n\`\`\``)
                        await interaction.reply({
                            content: "I'm afraid I haven't implemented this yet...",
                            ephemeral: true,
                        })
                        return
                    }
                    break
                }
                break
            case 'level-alert':
                switch (subCommand) {
                    case 'set': {
                        const enabled = interaction.options.getBoolean('enabled')
                        const channel = interaction.options.getChannel('channel')
                        const message = interaction.options.getString('message')

                        const levelAlerts = interaction.client.settings.get(interaction.guild.id, 'levelAlerts')
                        const errors = Array<string>()

                        if (enabled != null) {
                            levelAlerts.enabled = enabled
                        }
                        if (channel != null) {
                            if (channel.type == ChannelType.GuildText || ChannelType.GuildAnnouncement) {
                                levelAlerts.alertChannel = channel.id
                            } else {
                                errors.push('You must choose a text channel!')
                            }
                        }
                        if (message != null) {
                            levelAlerts.message = message
                        }

                        const jsonToSend : any = {
                            levelAlerts: levelAlerts
                        }
                        if (errors.length > 0) jsonToSend.errors = errors

                        interaction.client.settings.set(interaction.guild.id, levelAlerts, 'levelAlerts')

                        await interaction.reply({content: `\`\`\`json\n${JSON.stringify(jsonToSend, null, 4)}\n\`\`\``, ephemeral: true})
                    }
                    break
                }
        }

    } else if (subCommand != null) {
        switch (subCommand) {
            case 'show':
                let configStr = `\`\`\`json\n${JSON.stringify(config, null, 4)}\n\`\`\``
                await interaction.reply({content: configStr, ephemeral: false})
                break
            default:
                break
        }
    } else {
        await interaction.reply('You shouldn\'t reach this!')
    }
}