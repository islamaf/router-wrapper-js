import { FastifyInstance, FastifyPluginCallback, RouteOptions } from "fastify";
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
    make(): FastifyPluginCallback;
}

/**
 * Router Wrapper class for wrapping Fastify router to be more compact and chainable
 */
class FastifyRouterWrapper implements FastifyRouterWrapper {
    private routes: RouteOptions[] = [];
    constructor(
        private fastifyApp: FastifyInstance,
        private services?: Services
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

    private handleRoute = (method: HttpMethod, params: RouteParams) => {
        const route: RouteOptions = {
            method,
            schema: params.schema,
            preHandler: params.preHandler,
            url: params.path,
            handler: fastifyCfw(params.handler)
        };
        this.routes.push(route);
        return route;
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
