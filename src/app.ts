import Fastify from 'fastify';
import fastifyRawBody from 'fastify-raw-body';
import { ApiHandler } from 'seyfert';
import { connect } from 'mongoose';
import router from './router.js';

const envVariables = ['APP_PORT', 'REDIS_URL', 'MONGO_URL', 'POLAR_SECRET', 'DISCORD_TOKEN'];
for (const variable of envVariables) if (!process.env[variable]) {
    console.error(`The required environment variable "${variable}" wasn't found, exiting...`);
    process.exit(1);
};

const app = Fastify();
await app.register(fastifyRawBody, ({ global: false, runFirst: true }));
const client = new ApiHandler({ token: process.env.DISCORD_TOKEN ?? '' });

await connect(process.env.MONGO_URL ?? '', { dbName: 'bot' })
.then(() => console.log('Successfully connected to MongoDB'))
.catch(() => console.error('Failed to connect to MongoDB!'))

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

router(app, client);

app.listen({ port: Number(process.env.APP_PORT), host: '0.0.0.0' }).then((host) => {
    console.log(`Successfully started and listening on ${host}.`);
});
