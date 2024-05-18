"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fastifyCfw = void 0;
/**
 * Fastify Controller Function Wrapper
 * Wraps the function put into the controller in a try catch block
 * @param cf Controller Function
 * @returns JSON Response
 */
const fastifyCfw = (cf) => {
    return async (request, reply) => {
        const result = await cf(request);
        return {
            status: result.status,
            success: result.success,
            data: result.data
        };
    };
};
exports.fastifyCfw = fastifyCfw;
