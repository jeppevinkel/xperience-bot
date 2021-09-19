import {Snowflake} from "discord.js";

export default interface Level {
    xp : number
    role : Snowflake | null
}