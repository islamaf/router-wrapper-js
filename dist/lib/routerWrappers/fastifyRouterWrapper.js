"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastifyRouterWrapper = void 0;
const controllerWrappers_1 = require("../controllerWrappers");
/**
 * Router Wrapper class for wrapping Fastify router to be more compact and chainable
 */
class FastifyRouterWrapper {
    constructor(fastifyApp, services, sharedPreHandler) {
        this.fastifyApp = fastifyApp;
        this.services = services;
        this.sharedPreHandler = sharedPreHandler;
        this.routes = [];
        this.routesShared = {
            get: [],
            post: [],
            patch: [],
            delete: []
        };
        this.makeRoutes = () => {
            const registerRoutes = (fastify = this.fastifyApp, {}, done) => {
                this.routes.forEach((route) => {
                    fastify.route(route);
                });
                done();
            };
            return registerRoutes;
        };
        this.fastifyMiddlewareWrapper = (middleware) => {
            return async (req, reply) => {
                await middleware();
            };
        };
        this.handleRoute = (method, params) => {
            let preHandlers = params.preHandler ?? [];
            preHandlers.push(...this.shareMiddleware(method, params.path));
            preHandlers = preHandlers.map((ph) => this.fastifyMiddlewareWrapper(ph));
            const route = {
                method,
                schema: params.schema,
                preHandler: preHandlers,
                url: params.path,
                handler: (0, controllerWrappers_1.fastifyCfw)(params.handler)
            };
            this.routes.push(route);
            return route;
        };
        this.shareMiddleware = (method, path) => {
            if (this.sharedPreHandler && this.routesShared[method].includes(path)) {
                return this.sharedPreHandler.map((ph) => ph);
            }
            return [];
        };
        this.makeProtectedPreHandler = (preHandler) => {
            if (!this.services?.auth) {
                throw new Error("Add an authentication function in the constructor to be able to use protected routes.");
            }
            if (preHandler === undefined) {
                return [this.services.auth];
            }
            return [this.services.auth, ...preHandler];
        };
    }
    get(params) {
        this.handleRoute("get", params);
        return this;
    }
    protectedGet(params) {
        params.preHandler = this.makeProtectedPreHandler(params.preHandler);
        this.handleRoute("get", params);
        return this;
    }
    post(params) {
        this.handleRoute("post", params);
        return this;
    }
    protectedPost(params) {
        params.preHandler = this.makeProtectedPreHandler(params.preHandler);
        this.handleRoute("post", params);
        return this;
    }
    patch(params) {
        this.handleRoute("patch", params);
        return this;
    }
    protectedPatch(params) {
        params.preHandler = this.makeProtectedPreHandler(params.preHandler);
        this.handleRoute("patch", params);
        return this;
    }
    delete(params) {
        this.handleRoute("delete", params);
        return this;
    }
    protectedDelete(params) {
        params.preHandler = this.makeProtectedPreHandler(params.preHandler);
        this.handleRoute("delete", params);
        return this;
    }
    shareTo(routes) {
        if (routes.length > 0 && this.sharedPreHandler?.length === 0) {
            throw new Error("No middleware to share");
        }
        routes.forEach((route) => {
            const splitRoute = route.split(" ");
            const method = splitRoute[0].toLowerCase();
            const path = splitRoute[1];
            this.routesShared[method].push(path);
        });
        return this;
    }
    multiple(path, methods, params) {
        methods.forEach((method, idx) => this.handleRoute(method, { ...params[idx], path }));
        return this;
    }
    /**
     * Make the Fastify router ready to register
     * @returns Fastify router
     */
    make() {
        return this.makeRoutes();
    }
}
exports.FastifyRouterWrapper = FastifyRouterWrapper;
