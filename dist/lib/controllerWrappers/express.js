"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressCfw = void 0;
/**
 * Express Controller Function Wrapper
 * Wraps the function put into the controller in a try catch block
 * @param cf Controller Function
 * @returns JSON Response
 */
const expressCfw = (cf) => {
    return async (req, res, next) => {
        try {
            const result = await cf(req);
            return res
                .status(result.status)
                .json({ success: result.success, data: result.data });
        }
        catch (e) {
            next(e);
        }
    };
};
exports.expressCfw = expressCfw;
