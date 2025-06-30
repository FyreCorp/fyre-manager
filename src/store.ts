import { Redis } from "ioredis";
import { UpdateQuery } from "mongoose";
import { Collection } from "seyfert";
import Guild, { GuildI } from "./models/Guild.js";
import User, { UserI } from './models/User.js';

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

export const updateUser = async (userId: string, query: UpdateQuery<UserI>) => {
    let user = await User.findOne({ userId });
    if (!user) user = await User.create({ userId });

    user = await User.findOneAndUpdate({ userId }, query, { new: true });
    if (!user) throw new Error(`User not found in the database while updating: ${userId}`);

    await redis.del(`fs_user:${userId}`);
    await redis.srem(`fs_database_blocks:user`, userId);
};

export const updateGuild = async (guildId: string, query: UpdateQuery<GuildI>) => {
    let guild = await Guild.findOne({ guildId });
    if (!guild) guild = await Guild.create({ guildId });
    if (!guild) throw new Error(`Guild not found in the database: ${guildId}`);

    guild = await Guild.findOneAndUpdate({ guildId }, query, { new: true });
    if (!guild) throw new Error(`Guild not found in the database while updating: ${guildId}`);

    await redis.del(`fs_guild:${guildId}`);
    await redis.srem(`fs_database_blocks:guild`, guildId);
};
