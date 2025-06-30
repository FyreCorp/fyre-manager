import { ApiHandler } from "seyfert";
import { RESTPostAPIChannelMessageJSONBody } from "seyfert/lib/types/index.js";
import { redis } from "./store.js";
import { customAlphabet } from 'nanoid';
 
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
