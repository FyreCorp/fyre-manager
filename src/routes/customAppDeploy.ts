import { FastifyReply, FastifyRequest } from 'fastify';
import { ApiHandler } from 'seyfert';
import { pm2Connect, pm2Delete, pm2Disconnect, pm2Flush, pm2List, pm2Start, pm2Stop } from '../utilities.js';
import { Object, String } from '@sinclair/typebox';

export type CustomAppDeployRequest = FastifyRequest<{ Params: { id: string }, Body: { token: string, guildId: string } }>;

export const customAppDeploySchema = {
    body: Object({
        token: String({ minLength: 64 }),
        guildId: String({ minLength: 17, maxLength: 19 })
    }),
    params: Object({
        id: String({ minLength: 17, maxLength: 19 })
    })
};

export default async (_client: ApiHandler, request: CustomAppDeployRequest, response: FastifyReply) => {
    const connectError = await pm2Connect().then(() => false).catch(() => true);
    if (connectError) return response.code(500).send({ error: true, message: 'Failed to connect to the PM2 daemon (GoD).' });
    const processes = await pm2List().catch(() => null);

    if (!processes) {
        await pm2Disconnect();
        return response.code(500).send({ error: true, message: 'Failed to list the PM2 processes.' });
    };

    const appId = request.params.id;
    const appProcess = processes.find(({ name }) => name === `fs-instance-${appId}`);

    if (appProcess) {
        await pm2Stop(`fs-instance-${appId}`);
        await pm2Delete(`fs-instance-${appId}`);
    };

    await pm2Flush(`fs-instance-${appId}`);

    const startError = await pm2Start({
        script: 'build/index.js',
        name: `fs-instance-${appId}`,
        node_args: '-r dotenv/config',
        cwd: process.env.APPLICATION_PATH,
        args: process.argv.includes('--dev') ? '--dev' : undefined,
        env: {
            APP_ID: appId,
            APP_TOKEN: request.body.token,
            IS_CUSTOM_INSTANCE: 'true'
        }
    }).then(() => false).catch(() => true);

    if (startError) return response.code(500).send({ error: true, message: 'Failed to start new PM2 process.' });
    response.code(200).send({ error: false, message: 'Started new PM2 process with application credentials' });
};
