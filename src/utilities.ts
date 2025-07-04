import { ApiHandler } from "seyfert";
import { RESTPostAPIChannelMessageJSONBody } from "seyfert/lib/types/index.js";
import { redis } from "./store.js";
import { customAlphabet } from 'nanoid';
import { promisify } from 'node:util';
import pm2, { StartOptions } from 'pm2';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

export const wait = (ms: number) => new Promise((resolve) => setTimeout(() => resolve, ms));
export const s = (string: string) => string.replace(/`/g, '\\`').replace(/\*/g, '\\*').replace(/\|/g, '\\|').replace(/_/g, '\\_');

export const randomId = (length: number) => {
    const generator = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
    return generator(length);
};

export const sendDM = async ({ proxy }: ApiHandler, userId: string, body: RESTPostAPIChannelMessageJSONBody) => {
    let channelId = await redis.get(`fsm_dm_channel:${userId}`);

    if (!channelId) {
        const channel = await proxy.users('@me').channels.post({ body: { recipient_id: userId } }).catch(() => {});
        if (!channel) return;
        
        channelId = channel.id;
        await redis.set(`fsm_dm_channel:${userId}`, channelId);
        await redis.expire(`fsm_dm_channel:${userId}`, 2629746);
    };

    await proxy.channels(channelId).messages.post({ body }).catch(() => {});
};

export const pm2List = promisify(pm2.list).bind(pm2);
export const pm2Stop = promisify<string>(pm2.stop).bind(pm2);
export const pm2Flush = promisify(pm2.flush).bind(pm2);
export const pm2Start = promisify<StartOptions>(pm2.start).bind(pm2);
export const pm2Delete = promisify<string>(pm2.delete).bind(pm2);
export const pm2Connect = promisify(pm2.connect).bind(pm2);
export const pm2Describe = promisify(pm2.describe).bind(pm2);
export const pm2Disconnect = promisify(pm2.disconnect).bind(pm2);

export const getLastLines = async (file: string, lineCount: number) => {
    const lines: string[] = [];
    const stream = createReadStream(file, { encoding: 'utf-8' });
    const streamInterface = createInterface({ input: stream, crlfDelay: Infinity });

    for await (const line of streamInterface) {
        lines.push(line);
        if (lines.length > lineCount) lines.shift();
    };

    return lines.map((line) => line.replaceAll(/\x1B\[[0-9;]*[A-Za-z]/g, ''));
};
