import { s, sendDM } from "../utilities.js";
import { Order } from "@polar-sh/sdk/models/components/order.js";
import { ApiHandler } from "seyfert";
import { productKeys } from "../common.js";
import { updateGuild } from "../store.js";

const activateServerLicense = async (client: ApiHandler, data: Order) => {
    const guildId = String(data.metadata['activeGuildId']!);
    await updateGuild(guildId, { $set: { active: true } });
    const guild = await client.proxy.guilds(guildId).get();

    const lines = [
        `Thank you for purchasing a Fyre Server License for **${s(guild.name)}**.`,
        'Your server now has access to all the features of Fyre. To get started, read the [Fyre Docs](https://docs.fyre.bot).'
    ];

    await sendDM(client, data.customer.externalId!, { content: lines.join('\n') });
};

export default async (client: ApiHandler, data: Order) => {
    const productKey = productKeys[data.productId];
    if (!productKey) return;

    switch (productKey) {
        case 'guild-license': await activateServerLicense(client, data); break;
    };
};
