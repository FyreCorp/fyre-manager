import { FastifyInstance } from "fastify";
import { ApiHandler } from "seyfert";
import customAppDeploy, { CustomAppDeployRequest, customAppDeploySchema } from './routes/customAppDeploy.js';
import billingEvent from './routes/billingEvent.js';
import { authCheck } from './extra.js';
import customAppLogs, { CustomAppLogsRequest, customAppLogsSchema } from './routes/customAppLogs.js';

export default async (app: FastifyInstance, client: ApiHandler) => {
    app.get('/health', (_request, response) => {
        response.code(200).send({ error: false, data: { status: 'online' } });
    });

    app.get(
        '/apps/:id/logs', 
        { schema: customAppLogsSchema, preHandler: authCheck },
        (request: CustomAppLogsRequest, response) => customAppLogs(client, request, response)
    );

    app.post(
        '/apps/:id/deploy',
        { schema: customAppDeploySchema, preHandler: authCheck },
        (request: CustomAppDeployRequest, response) => customAppDeploy(client, request, response)
    );

    app.post('/billing', ({ config: { rawBody: true } }), (request, response) => billingEvent(client, request, response));
};
