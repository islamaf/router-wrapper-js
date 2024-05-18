"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressRouterWrapper = void 0;
const express_1 = require("express");
const controllerWrappers_1 = require("../controllerWrappers");
/**
 * Router Wrapper class for wrapping Express router to be more compact and chainable
 */
class ExpressRouterWrapper {
    constructor(services = {}, sharedMiddleware) {
        this.services = services;
        this.sharedMiddleware = sharedMiddleware;
        this.routes = {
            get: [],
            post: [],
            patch: [],
            delete: [],
        };
        this.handleRoute = (method, params) => {
            const middlwares = params.middleware ?? [];
            middlwares.push(...this.shareMiddleware(method, params.path));
            this.router[method](params.path, middlwares, (0, controllerWrappers_1.expressCfw)(params.handler));
            return this;
        };
        this.shareMiddleware = (method, path) => {
            if (this.sharedMiddleware && this.routes[method].includes(path)) {
                return this.sharedMiddleware;
            }
            return [];
        };
        this.makeProtectedMiddleware = (middleware) => {
            if (!this.services?.auth) {
                throw new Error("Add an authentication function in the constructor to be able to use protected routes.");
            }
            if (middleware === undefined) {
                return [this.services.auth];
            }
            return [this.services.auth, ...middleware];
        };
        this.router = (0, express_1.Router)();
    }
    get(params) {
        return this.handleRoute("get", params);
    }
    protectedGet(params) {
        params.middleware = this.makeProtectedMiddleware(params.middleware);
        return this.handleRoute("get", params);
    }
    post(params) {
        return this.handleRoute("post", params);
    }
    protectedPost(params) {
        params.middleware = this.makeProtectedMiddleware(params.middleware);
        return this.handleRoute("post", params);
    }
    patch(params) {
        return this.handleRoute("patch", params);
    }
    protectedPatch(params) {
        params.middleware = this.makeProtectedMiddleware(params.middleware);
        return this.handleRoute("patch", params);
    }
    delete(params) {
        return this.handleRoute("delete", params);
    }
    protectedDelete(params) {
        params.middleware = this.makeProtectedMiddleware(params.middleware);
        return this.handleRoute("delete", params);
    }
    /**
     * Add routes to use the shared middlewares
     * @param routes string
     * @returns this
     */
    shareTo(routes) {
        if (routes.length > 0 && this.sharedMiddleware?.length === 0) {
            throw new Error("No middleware to share");
        }
        routes.forEach((route) => {
            const splitRoute = route.split(" ");
            const method = splitRoute[0].toLowerCase();
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
    multiple(path, methods, params) {
        methods.forEach((method, idx) => this.handleRoute(method, { ...params[idx], path }));
        return this;
    }
    /**
     * Make the Express router ready to use
     * @returns Express router
     */
    make() {
        return this.router;
    }
}
exports.ExpressRouterWrapper = ExpressRouterWrapper;
