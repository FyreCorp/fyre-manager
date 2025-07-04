import { Order } from "@polar-sh/sdk/models/components/order.js";
import { ApiHandler } from "seyfert";
import { productKeys } from "../../common.js";
import purchase from "./purchase.js";
import subscriptionCreate from './subscriptionCreate.js';

export default async (client: ApiHandler, data: Order) => {
    const productKey = productKeys[data.productId];
    if (!productKey) return;

    switch (data.billingReason) {
        case 'purchase': purchase(client, data, productKey); break;
        case 'subscription_create': subscriptionCreate(client, data, productKey); break;
    };
};
