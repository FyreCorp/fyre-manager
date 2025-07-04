import { DoneFuncWithErrOrRes, FastifyReply, FastifyRequest } from 'fastify';

export const authCheck = (request: FastifyRequest, response: FastifyReply, done: DoneFuncWithErrOrRes) => {
    const header = request.headers['authorization'];
    if (!header || header !== process.env.APP_TOKEN) return response.code(401).send({
        error: true,
        message: 'This route requires authorization via the "Authorization" header.'
    });

    done();
};
