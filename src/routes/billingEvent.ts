import { validateEvent } from '@polar-sh/sdk/webhooks.js';
import { FastifyReply, FastifyRequest } from 'fastify';
import orderPaid from '../events/orderPaid/orderPaid.js';
import { ApiHandler } from 'seyfert';

export default async (client: ApiHandler, request: FastifyRequest, response: FastifyReply) => {
    let event: ReturnType<typeof validateEvent> | undefined;

    try {
        event = validateEvent(
            request.rawBody!,
            request.headers as Record<string, string>,
            process.env.POLAR_SECRET ?? ''
        )
    } catch (error) {
        return response.code(400).send({
            error: true,
            message: "The provided event body or event signature are invalid."
        });
    };

    if (!event) return response.code(400).send({
        error: false,
        message: "The provided event body or event signature are invalid."
    });

    switch (event.type) {
        case 'order.paid': orderPaid(client, event.data); break;
    };

    await response.code(200).send({ error: false, data: null });
};
