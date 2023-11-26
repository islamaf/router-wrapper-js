import { Request, Response, NextFunction } from "express";

/**
 * Express Controller Function Wrapper
 * Wraps the function put into the controller in a try catch block
 * @param cf Controller Function
 * @returns JSON Response
 */
export const expressCfw = (cf: Function) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await cf(req);

            return res
                .status(result.status)
                .json({ success: result.success, data: result.data });
        } catch (e) {
            next(e);
        }
    };
};
