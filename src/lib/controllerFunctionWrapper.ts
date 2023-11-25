import { Request, Response, NextFunction } from "express";

/**
 * Controller Function Wrapper
 * Wraps the function put into the controller in a try catch block
 * @param cf Controller Function
 * @returns JSON Response
 */
export const cfw = (cf: Function) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await cf(req);

            return res
                .status(data.status)
                .json({ success: data.success, data: data.data });
        } catch (e) {
            next(e);
        }
    };
};
