import { Redis } from "ioredis";
import { UpdateQuery } from "mongoose";
import { Collection } from "seyfert";
import Guild, { GuildI } from "./models/Guild.js";

export const redis = new Redis(process.env.REDIS_URL ?? '');
export const reviver = (_key: string, value: any) => {
    if (typeof value === 'object' && value !== null) if (value.dataType === 'Map') return new Collection(value.value);
    return value;
};

export const replacer = (_key: string, value: any) => {
    if (typeof value === 'bigint') return value.toString();
    if (value instanceof Map || value instanceof Collection) return { dataType: 'Map', value: [...value]};
    return value;
};

export const updateGuild = async (guildId: string, query: UpdateQuery<GuildI>) => {
    const guild = await Guild.findOneAndUpdate({ guildId }, query, { new: true });
    if (!guild) throw new Error(`Guild not found in the database: ${guildId}`);

    await redis.del(`fs_guild:${guildId}`);
    await redis.srem(`fs_database_blocks:guild`, guildId);
};
