import { validateEvent } from "@polar-sh/sdk/webhooks.js";
import { FastifyInstance } from "fastify";
import { ApiHandler } from "seyfert";
import orderPaid from "./events/orderPaid/orderPaid.js";

export default async (app: FastifyInstance, client: ApiHandler) => {
    app.get('/health', (_request, response) => {
        response.code(200).send({ error: false, data: { status: 'online' } });
    });

    app.post('/billing', ({ config: { rawBody: true } }), (request, response) => {
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

        response.code(200).send({ error: false, data: null });
    });
};
