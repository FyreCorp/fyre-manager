import Fastify from 'fastify';
import fastifyRawBody from 'fastify-raw-body';
import { ApiHandler } from 'seyfert';
import { connect } from 'mongoose';
import router from './router.js';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

const envVariables = ['APP_PORT', 'REDIS_URL', 'MONGO_URL', 'POLAR_SECRET', 'DISCORD_TOKEN', 'APPLICATION_PATH', 'APP_TOKEN'];
for (const variable of envVariables) if (!process.env[variable]) {
    console.error(`The required environment variable "${variable}" wasn't found, exiting...`);
    process.exit(1);
};

const app = Fastify().withTypeProvider<TypeBoxTypeProvider>();
const client = new ApiHandler({ token: process.env.DISCORD_TOKEN ?? '' });

await connect(process.env.MONGO_URL ?? '', { dbName: 'bot' })
.then(() => console.log('Successfully connected to MongoDB'))
.catch(() => console.error('Failed to connect to MongoDB!'))

// process.on('uncaughtException', console.error);
// process.on('unhandledRejection', console.error);

app.setErrorHandler((error, request, response) => {
    const validationError = error.validation?.[0];

    if (validationError) {
        const lines = [
            `Route ${error.validationContext} `,
            validationError.instancePath ? `"${validationError.instancePath.replace('/', '')}" ` : '',
            `${validationError.message}.`
        ];

        return response.code(400).send({ error: true, message: lines.join('') });
    };

    response.send(error);
});

app.setNotFoundHandler((request, response) => response.code(404).send({
    error: true,
    message: `Route ${request.method} ${request.url} not found.`
}));

await app.register(fastifyRawBody, ({ global: false, runFirst: true }));
router(app, client);

app.listen({ port: Number(process.env.APP_PORT), host: '0.0.0.0' }).then((host) => {
    console.log(`Successfully started and listening on ${host}.`);
});
