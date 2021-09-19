import Enmap from "enmap";

declare module 'discord.js' {
    export interface Client {
        settings : Enmap
        levels : Enmap
    }
}