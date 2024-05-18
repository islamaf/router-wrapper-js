"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cfw = void 0;
/**
 * Controller Function Wrapper
 * Wraps the function put into the controller in a try catch block
 * @param cf Controller Function
 * @returns JSON Response
 */
const cfw = (cf) => {
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
exports.cfw = cfw;
