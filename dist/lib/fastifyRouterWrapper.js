"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastifyRouterWrapper = void 0;
const controllerWrappers_1 = require("./controllerWrappers");
class FastifyRouterWrapper {
    constructor(fastifyApp, services) {
        this.fastifyApp = fastifyApp;
        this.services = services;
        this.routes = [];
        this.handleRoute = (method, path, f, schema, preHandler) => {
            const route = {
                method,
                schema,
                preHandler,
                url: path,
                handler: (0, controllerWrappers_1.fastifyCfw)(f)
            };
            this.routes.push(route);
            return route;
        };
        this.makeProtectedPreHandler = (preHandler) => {
            if (preHandler === undefined) {
                return undefined;
            }
            return [...preHandler].concat([this.services?.auth]);
        };
    }
    get(path, f, schema, preHandler) {
        this.handleRoute("get", path, f, schema, preHandler);
        return this;
    }
    protectedGet(path, f, schema, preHandler) {
        this.handleRoute("get", path, f, schema, this.makeProtectedPreHandler(preHandler));
        return this;
    }
    post(path, f, schema, preHandler) {
        this.handleRoute("post", path, f, schema, preHandler);
        return this;
    }
    protectedPost(path, f, schema, preHandler) {
        this.handleRoute("post", path, f, schema, this.makeProtectedPreHandler(preHandler));
        return this;
    }
    patch(path, f, schema, preHandler) {
        this.handleRoute("patch", path, f, schema, preHandler);
        return this;
    }
    protectedPatch(path, f, schema, preHandler) {
        this.handleRoute("patch", path, f, schema, this.makeProtectedPreHandler(preHandler));
        return this;
    }
    delete(path, f, schema, preHandler) {
        this.handleRoute("delete", path, f, schema, preHandler);
        return this;
    }
    protectedDelete(path, f, schema, preHandler) {
        this.handleRoute("delete", path, f, schema, this.makeProtectedPreHandler(preHandler));
        return this;
    }
    make() {
        const registerRoutes = () => {
            this.routes.forEach((route) => {
                this.fastifyApp.route(route);
            });
        };
        return registerRoutes;
    }
}
exports.FastifyRouterWrapper = FastifyRouterWrapper;
