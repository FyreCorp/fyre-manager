import { FastifyReply, FastifyRequest } from 'fastify';
import { ApiHandler } from 'seyfert';
import { getLastLines, pm2Connect, pm2Describe } from '../utilities.js';
import { existsSync } from 'node:fs';
import { Object, String } from '@sinclair/typebox';

export type CustomAppLogsRequest = FastifyRequest<{ Params: { id: string }}>;

interface LogLine {
    content: string;
    type: 'log' | 'error';
}

export const customAppLogsSchema = {
    params: Object({
        id: String({ minLength: 17, maxLength: 19 })
    })
};

export default async (client: ApiHandler, request: CustomAppLogsRequest, response: FastifyReply) => {
    const connectError = await pm2Connect().then(() => false).catch(() => true);
    if (connectError) return response.code(500).send({ error: true, message: 'Failed to connect to the PM2 daemon (GoD).' });

    const appId = request.params.id;
    const process = await pm2Describe(`fs-instance-${appId}`).catch(() => null);
    if (!process?.[0]) return response.code(500).send({ error: true, message: 'Failed to describe PM2 process.' });

    const outPath = process[0].pm2_env?.pm_out_log_path;
    const errorPath = process[0].pm2_env?.pm_err_log_path;
    if (!outPath && !errorPath) return response.code(200).send({ error: false, data: [] });

    const lines: LogLine[] = [];

    if (outPath && existsSync(outPath)) {
        const outLines = await getLastLines(outPath, 25);
        lines.push(...outLines.map((content) => ({ type: 'log' as 'log', content })));
    };

    if (errorPath && existsSync(errorPath)) {
        const errorLogs = await getLastLines(errorPath, 25);
        lines.push(...errorLogs.map((content) => ({ type: 'error' as 'error', content })));
    };

    response.code(200).send({ error: false, data: lines });
};
