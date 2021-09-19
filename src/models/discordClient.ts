// import {Client, ClientOptions, Snowflake} from "discord.js";
// import Enmap from "enmap";
// import Level from "./level";
//
// export default class DiscordClient extends Client {
//     public settings : Enmap
//     public levels : Enmap
//
//     constructor(options: ClientOptions) {
//         super(options)
//
//         this.settings = new Enmap({
//             name: 'settings',
//             fetchAll: false,
//             autoFetch: true,
//             cloneLevel: 'deep',
//             autoEnsure: {
//                 excludesChannels: Array<Snowflake>(),
//                 excludedRoles: Array<Snowflake>(),
//                 levels: Array<Level>(),
//                 maxXp: 1,
//                 minXp: 1,
//                 messageCooldown: 60,
//                 levelAlerts: {
//                     enabled: false,
//                     alertChannel: '',
//                     alertMessage: '{displayName} has reached level **{level}**!'
//                 },
//                 leaderboard: {
//                     enabled: true,
//                     adminOnly: false
//                 }
//             }
//         })
//
//         this.levels = new Enmap({
//             name: 'levels',
//             fetchAll: false,
//             autoFetch: true,
//             cloneLevel: 'deep'
//         })
//     }
// }