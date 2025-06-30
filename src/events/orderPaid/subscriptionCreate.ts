import { Order } from "@polar-sh/sdk/models/components/order.js";
import { ApiHandler, Container, TextDisplay } from "seyfert";
import { defaultColor, productKeys } from "../../common.js";
import { s, sendDM } from "../../utilities.js";
import { MessageFlags } from "seyfert/lib/types/index.js";
import CustomApp from "../../models/CustomApp.js";

const sendSubscriptionNotice = async (client: ApiHandler, data: Order) => {
    const guildId = String(data.metadata['activeGuildId']!);
    const guild = await client.proxy.guilds(guildId).get();

    await CustomApp.create({
        guildId,
        ownerId: data.customer.externalId,
        appId: data.customFieldData?.appId
    });

    const lines = [
        `### :tada: Custom Branding Sub Activated\n`,
        `**App ID**: \`${data.customFieldData?.appId}\`\n`,
        `**Server**: ||${s(guild.name)} [\`${guild.id}\`]||\n\n`,
        `**Order ID**: ||\`${data.id}\`||\n`,
        `**Subscription ID**: ||\`${data.subscriptionId}\`||\n\n`,
        `Thank you for subscribing to Fyre Custom Branding, `,
        `you can now setup your custom branded app. To get started, use </custom-app activate:>.\n\n`,
        `-# Keep your Order ID safe, it's the only way to recover or transfer this subscription.`
    ];

    const textDisplay = new TextDisplay({ content: lines.join('') });
    const container = new Container({ accent_color: defaultColor }).setComponents(textDisplay).toJSON();
    await sendDM(client, data.customer.externalId!, { components: [container], flags: MessageFlags.IsComponentsV2 });
};

export default async (client: ApiHandler, data: Order, productKey: keyof typeof productKeys) => {
    await sendSubscriptionNotice(client, data);
};
