import { NextFunction, Request, Response, Router } from "express";
import { expressCfw } from "../controllerWrappers";

type HttpMethod = "get" | "post" | "patch" | "delete";
type RouteParams = {
    path: string;
    handler: Function;
    middleware?: any[];
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
    shareTo(routes: string[]): this;
    multiple(
        path: string,
        methods: string[],
        params: Omit<RouteParams, "path">[]
    ): this;
    make(): Router;
}

/**
 * Router Wrapper class for wrapping Express router to be more compact and chainable
 */
class ExpressRouterWrapper implements ExpressRouterWrapper {
    private router: Router;
    private routes: {
        get: string[];
        post: string[];
        patch: string[];
        delete: string[];
    } = {
        get: [],
        post: [],
        patch: [],
        delete: [],
    };
    constructor(
        private services: Services = {},
        private sharedMiddleware?: Function[]
    ) {
        this.router = Router();
    }

    get(params: RouteParams) {
        return this.handleRoute("get", params);
    }

    protectedGet(params: RouteParams) {
        params.middleware = this.makeProtectedMiddleware(params.middleware);
        return this.handleRoute("get", params);
    }

    post(params: RouteParams) {
        return this.handleRoute("post", params);
    }

    protectedPost(params: RouteParams) {
        params.middleware = this.makeProtectedMiddleware(params.middleware);
        return this.handleRoute("post", params);
    }

    patch(params: RouteParams) {
        return this.handleRoute("patch", params);
    }

    protectedPatch(params: RouteParams) {
        params.middleware = this.makeProtectedMiddleware(params.middleware);
        return this.handleRoute("patch", params);
    }

    delete(params: RouteParams) {
        return this.handleRoute("delete", params);
    }

    protectedDelete(params: RouteParams) {
        params.middleware = this.makeProtectedMiddleware(params.middleware);
        return this.handleRoute("delete", params);
    }

    /**
     * Add routes to use the shared middlewares
     * @param routes string
     * @returns this
     */
    shareTo(routes: string[]) {
        if (routes.length > 0 && this.sharedMiddleware?.length === 0) {
            throw new Error("No middleware to share");
        }

        routes.forEach((route: string) => {
            const splitRoute = route.split(" ");
            const method = <HttpMethod>splitRoute[0].toLowerCase();
            const path = splitRoute[1];

            this.routes[method].push(path);
        });

        return this;
    }

    /**
     * Accept multiple methods for one route each method would have a separate handler and middleware.
     * Route parameters are also set as per the sequence of the methods[]
     * e.g:
     * if
     *   methods=["get", "post"]
     * then the route parameters would look like this
     *   [GET_ROUTE_PARAMS, POST_ROUTE_PARAMS]
     * so the route parameters order follows the methods array order
     */
    multiple(
        path: string,
        methods: HttpMethod[],
        params: Omit<RouteParams, "path">[]
    ) {
        methods.forEach((method, idx) =>
            this.handleRoute(method, { ...params[idx], path })
        );
        return this;
    }

    /**
     * Make the Express router ready to use
     * @returns Express router
     */
    make() {
        return this.router;
    }

    private handleRoute = (method: HttpMethod, params: RouteParams) => {
        const middlwares = params.middleware ?? [];
        middlwares.push(...this.shareMiddleware(method, params.path));
        this.router[method](
            params.path,
            middlwares,
            expressCfw(params.handler)
        );
        return this;
    };

    private shareMiddleware = (method: HttpMethod, path: string) => {
        if (this.sharedMiddleware && this.routes[method].includes(path)) {
            return this.sharedMiddleware;
        }

        return [];
    };

    private makeProtectedMiddleware = (middleware?: any[]) => {
        if (!this.services?.auth) {
            throw new Error(
                "Add an authentication function in the constructor to be able to use protected routes."
            );
        }

        if (middleware === undefined) {
            return [this.services.auth];
        }
        return [this.services.auth, ...middleware];
    };
}

export { ExpressRouterWrapper };
