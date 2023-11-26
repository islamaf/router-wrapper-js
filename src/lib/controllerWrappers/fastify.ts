import { FastifyRequest, FastifyReply } from "fastify";

/**
 * Fastify Controller Function Wrapper
 * Wraps the function put into the controller in a try catch block
 * @param cf Controller Function
 * @returns JSON Response
 */
export const fastifyCfw = (cf: Function) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const result = await cf(request);

        return {
            status: result.status,
            success: result.success,
            data: result.data
        };
    };
};
