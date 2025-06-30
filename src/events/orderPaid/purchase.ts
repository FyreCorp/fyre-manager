import { Order } from "@polar-sh/sdk/models/components/order.js";
import { ApiHandler, Container, TextDisplay } from "seyfert";
import { MessageFlags } from 'seyfert/lib/types/index.js';
import { defaultColor, productKeys } from "../../common.js";
import { updateGuild, updateUser } from "../../store.js";
import { s, sendDM } from "../../utilities.js";

export const activateServerLicense = async (client: ApiHandler, data: Order) => {
    const guildId = String(data.metadata['activeGuildId']!);
    await updateGuild(guildId, { $set: { active: true } });
    const guild = await client.proxy.guilds(guildId).get();

    const lines = [
        `### :tada: License Activated\n`,
        `**Server**: ||${s(guild.name)} [\`${guild.id}\`]||\n`,
        `**Order ID**: ||\`${data.id}\`||\n\n`,
        `Thank you for purchasing a Fyre Server License, `,
        `your server now has access to all of Fyre's features. To get started, read the [Fyre Docs](https://docs.fyre.bot).\n\n`,
        `-# Keep your Order ID safe, it's the only way to recover or transfer this license.`
    ];

    const textDisplay = new TextDisplay({ content: lines.join('') });
    const container = new Container({ accent_color: defaultColor }).setComponents(textDisplay).toJSON();
    await sendDM(client, data.customer.externalId!, { components: [container], flags: MessageFlags.IsComponentsV2 });
};

const activateUserLicense = async (client: ApiHandler, data: Order) => {
    const activeUserId = String(data.metadata.activeUserId);
    await updateUser(activeUserId, { $set: { active: true } });

    const subscriberId = data.customer.externalId!;
    const activeUser = await client.proxy.users(activeUserId).get();

    const lines = [
        `### :tada: License Activated\n`,
        `**User**: ||${s(activeUser.global_name ? `${activeUser.global_name} (${activeUser.username})` : activeUser.username)}||\n`,
        `**Order ID**: ||\`${data.id}\`||\n\n`,
        `Thank you for purchasing a Fyre User License, `,
    ];

    if (activeUserId === subscriberId) {
        lines.push(
            `you now have access to all of Fyre's user features. `,
            `To get started, read the [Fyre Docs](<https://docs.fyre.bot>).`
        );
    } else {
        lines.push(`${s(activeUser.global_name ?? activeUser.username)} now has access to all of Fyre's user features.`);
        const subscriber = await client.proxy.users(subscriberId).get();

        const giftLines = [
            `### :tada: License Gifted!\n`,
            s(subscriber.global_name ? `${subscriber.global_name} (${subscriber.username})` : subscriber.username),
            ' has gifted you a Fyre User License.\n',
            `You now have access to all of Fyre's user features. To get started, read the [Fyre Docs](<https://docs.fyre.bot>)`
        ];

        const textDisplay = new TextDisplay({ content: giftLines.join('') });
        const container = new Container({ accent_color: defaultColor }).setComponents(textDisplay).toJSON();
        await sendDM(client, activeUserId, { components: [container], flags: MessageFlags.IsComponentsV2 });
    };

    lines.push(`\n\n-# Keep your Order ID safe, it's the only way to recover this license.`);
    const textDisplay = new TextDisplay({ content: lines.join('') });
    const container = new Container({ accent_color: defaultColor }).setComponents(textDisplay).toJSON();
    await sendDM(client, subscriberId, { components: [container], flags: MessageFlags.IsComponentsV2 });
};

export default async (client: ApiHandler, data: Order, productKey: keyof typeof productKeys) => {
    switch (productKey) {
        case 'user-license': await activateUserLicense(client, data); break;
        case 'guild-license': await activateServerLicense(client, data); break;
    };
};
