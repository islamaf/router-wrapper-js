import {
    FastifyInstance,
    FastifyPluginCallback,
    FastifyReply,
    FastifyRequest,
    RouteOptions
} from "fastify";
import { fastifyCfw } from "../controllerWrappers";

type HttpMethod = "get" | "post" | "patch" | "delete";
type Services = {
    auth?: any;
};
type RouteParams = {
    path: string;
    handler: Function;
    schema?: {};
    preHandler?: any[];
};
interface FastifyRouterWrapper {
    get(params: RouteParams): this;
    protectedGet(params: RouteParams): this;
    post(params: RouteParams): this;
    protectedPost(params: RouteParams): this;
    patch(params: RouteParams): this;
    protectedPatch(params: RouteParams): this;
    delete(params: RouteParams): this;
    protectedDelete(params: RouteParams): this;
    shareTo(routes: string[]): this;
    make(): FastifyPluginCallback;
}

/**
 * Router Wrapper class for wrapping Fastify router to be more compact and chainable
 */
class FastifyRouterWrapper implements FastifyRouterWrapper {
    private routes: RouteOptions[] = [];
    private routesShared: {
        get: string[];
        post: string[];
        patch: string[];
        delete: string[];
    } = {
        get: [],
        post: [],
        patch: [],
        delete: []
    };
    constructor(
        private fastifyApp: FastifyInstance,
        private services?: Services,
        private sharedPreHandler?: any[]
    ) {}

    get(params: RouteParams) {
        this.handleRoute("get", params);
        return this;
    }

    protectedGet(params: RouteParams) {
        params.preHandler = this.makeProtectedPreHandler(params.preHandler);
        this.handleRoute("get", params);
        return this;
    }

    post(params: RouteParams) {
        this.handleRoute("post", params);
        return this;
    }

    protectedPost(params: RouteParams) {
        params.preHandler = this.makeProtectedPreHandler(params.preHandler);
        this.handleRoute("post", params);
        return this;
    }

    patch(params: RouteParams) {
        this.handleRoute("patch", params);
        return this;
    }

    protectedPatch(params: RouteParams) {
        params.preHandler = this.makeProtectedPreHandler(params.preHandler);
        this.handleRoute("patch", params);
        return this;
    }

    delete(params: RouteParams) {
        this.handleRoute("delete", params);
        return this;
    }

    protectedDelete(params: RouteParams) {
        params.preHandler = this.makeProtectedPreHandler(params.preHandler);
        this.handleRoute("delete", params);
        return this;
    }

    shareTo(routes: string[]) {
        if (routes.length > 0 && this.sharedPreHandler?.length === 0) {
            throw new Error("No middleware to share");
        }

        routes.forEach((route: string) => {
            const splitRoute = route.split(" ");
            const method = <HttpMethod>splitRoute[0].toLowerCase();
            const path = splitRoute[1];

            this.routesShared[method].push(path);
        });

        return this;
    }

    /**
     * Make the Fastify router ready to register
     * @returns Fastify router
     */
    make(): FastifyPluginCallback {
        return this.makeRoutes();
    }

    private makeRoutes = () => {
        const registerRoutes: FastifyPluginCallback = (
            fastify = this.fastifyApp,
            {},
            done
        ) => {
            this.routes.forEach((route) => {
                fastify.route(route);
            });
            done();
        };
        return registerRoutes;
    };

    private fastifyMiddlewareWrapper = (middleware: Function) => {
        return async (req: FastifyRequest, reply: FastifyReply) => {
            await middleware();
        };
    };

    private handleRoute = (method: HttpMethod, params: RouteParams) => {
        let preHandlers = params.preHandler ?? [];
        preHandlers.push(...this.shareMiddleware(method, params.path));
        preHandlers = preHandlers.map((ph) =>
            this.fastifyMiddlewareWrapper(ph)
        );
        const route: RouteOptions = {
            method,
            schema: params.schema,
            preHandler: preHandlers,
            url: params.path,
            handler: fastifyCfw(params.handler)
        };
        this.routes.push(route);
        return route;
    };

    private shareMiddleware = (method: HttpMethod, path: string) => {
        if (this.sharedPreHandler && this.routesShared[method].includes(path)) {
            return this.sharedPreHandler.map((ph) => ph);
        }

        return [];
    };

    private makeProtectedPreHandler = (preHandler?: any[]) => {
        if (!this.services?.auth) {
            throw new Error(
                "Add an authentication function in the constructor to be able to use protected routes."
            );
        }

        if (preHandler === undefined) {
            return [this.services.auth];
        }
        return [this.services.auth, ...preHandler];
    };
}

export { FastifyRouterWrapper };
