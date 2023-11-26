import { NextFunction, Request, Response, Router } from "express";
import { expressCfw } from "../controllerWrappers";

type HttpMethod = "get" | "post" | "patch" | "delete";
type RouteParams = {
    path: string;
    handler: Function;
    middlewares?: any[];
};
type Services = {
    auth?: any;
};
interface ExpressRouterWrapper {
    get(params: RouteParams): this;
    protectedGet(params: RouteParams): this;
    post(params: RouteParams): this;
    protectedPost(params: RouteParams): this;
    patch(params: RouteParams): this;
    protectedPatch(params: RouteParams): this;
    delete(params: RouteParams): this;
    protectedDelete(params: RouteParams): this;
    make(): Router;
}

/**
 * Router Wrapper class for wrapping Express router to be more compact and chainable
 */
class ExpressRouterWrapper implements ExpressRouterWrapper {
    private router: Router;
    constructor(private services: Services = {}) {
        this.router = Router();
    }

    get(params: RouteParams) {
        return this.handleRoute("get", params);
    }

    protectedGet(params: RouteParams) {
        params.middlewares = this.makeProtectedMiddleware(params.middlewares);
        return this.handleRoute("get", params);
    }

    post(params: RouteParams) {
        return this.handleRoute("post", params);
    }

    protectedPost(params: RouteParams) {
        params.middlewares = this.makeProtectedMiddleware(params.middlewares);
        return this.handleRoute("post", params);
    }

    patch(params: RouteParams) {
        return this.handleRoute("patch", params);
    }

    protectedPatch(params: RouteParams) {
        params.middlewares = this.makeProtectedMiddleware(params.middlewares);
        return this.handleRoute("patch", params);
    }

    delete(params: RouteParams) {
        return this.handleRoute("delete", params);
    }

    protectedDelete(params: RouteParams) {
        params.middlewares = this.makeProtectedMiddleware(params.middlewares);
        return this.handleRoute("delete", params);
    }

    /**
     * Make the Express router ready to use
     * @returns Express router
     */
    make() {
        return this.router;
    }

    private expressMiddlewareWrapper = (middleware: Function) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                await middleware();
                next();
            } catch (e) {
                next(e);
            }
        };
    };

    private handleRoute = (method: HttpMethod, params: RouteParams) => {
        const middlwares = params.middlewares?.map((m) =>
            this.expressMiddlewareWrapper(m)
        );
        this.router[method](
            params.path,
            middlwares ?? [],
            expressCfw(params.handler)
        );
        return this;
    };

    private makeProtectedMiddleware = (middlewares?: any[]) => {
        if (!this.services?.auth) {
            throw new Error(
                "Add an authentication function in the constructor to be able to use protected routes."
            );
        }

        if (middlewares === undefined) {
            return [this.services.auth];
        }
        return [this.services.auth, ...middlewares];
    };
}

export { ExpressRouterWrapper };
