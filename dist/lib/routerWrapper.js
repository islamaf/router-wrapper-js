"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterWrapper = void 0;
const express_1 = require("express");
const controllerFunctionWrapper_1 = require("./controllerFunctionWrapper");
/**
 * Router Wrapper class for wrapping express router to be more compact and chainable
 */
class RouterWrapper {
    constructor(services = {}) {
        this.services = services;
        this.router = (0, express_1.Router)();
        if (services.multer) {
            this.multer = services.multer;
        }
    }
    /**
     * Express GET method
     * @param path String
     * @param f Controller function
     * @param custom Custom middleware
     * @returns Router Wrapper object
     */
    get(path, f, custom) {
        return this.getHandler({ path, f, custom });
    }
    /**
     * Express GET method with authentication middleware
     * @param path String
     * @param f Controller function
     * @param custom Custom middleware
     * @returns Router Wrapper object
     */
    protectedGet(path, f, custom) {
        return this.getHandler({ path, f, requiresAuth: true, custom });
    }
    /**
     * Express POST method with options
     * @param path String
     * @param f Controller function
     * @param custom Custom middleware
     * @param options Object of options to include supported middlware
     * @returns Router Wrapper object
     */
    post(path, f, options, custom) {
        return this.postHandler({ path, f, multer: options?.multer, custom });
    }
    /**
     * Express POST method with authentication middleware and options
     * @param path String
     * @param f Controller function
     * @param custom Custom middleware
     * @param options Object of options to include supported middlware
     * @returns Router Wrapper object
     */
    protectedPost(path, f, options, custom) {
        return this.postHandler({
            path,
            f,
            requiresAuth: true,
            multer: options?.multer,
            custom
        });
    }
    /**
     * Express PATCH method with options
     * @param path String
     * @param f Controller function
     * @param custom Custom middleware
     * @param options Object of options to include supported middlware
     * @returns Router Wrapper object
     */
    patch(path, f, options, custom) {
        return this.patchHandler({ path, f, multer: options?.multer, custom });
    }
    /**
     * Express PATCH method with authentication middleware and options
     * @param path String
     * @param f Controller function
     * @param custom Custom middleware
     * @param options Object of options to include supported middlware
     * @returns Router Wrapper object
     */
    protectedPatch(path, f, options, custom) {
        return this.patchHandler({
            path,
            f,
            requiresAuth: true,
            multer: options?.multer,
            custom
        });
    }
    /**
     * Express DELETE method
     * @param path String
     * @param f Controller function
     * @param custom Custom middleware
     * @returns Router Wrapper object
     */
    delete(path, f, custom) {
        return this.deleteHandler({ path, f, custom });
    }
    /**
     * Express DELETE method with authentication middleware
     * @param path String
     * @param f Controller function
     * @param custom Custom middleware
     * @returns Router Wrapper object
     */
    protectedDelete(path, f, custom) {
        return this.deleteHandler({ path, f, requiresAuth: true, custom });
    }
    /**
     * Make the router
     * @returns Express router
     */
    make() {
        return this.router;
    }
    setMiddlewares({ multer, custom, requiresAuth = false }) {
        let middlewares = custom ?? [];
        if (requiresAuth) {
            middlewares.push(this.services.auth);
        }
        if (this.multer && multer) {
            if (Array.isArray(multer)) {
                middlewares.push(this.multer.fields(multer));
            }
            else if (typeof multer === "string") {
                middlewares.push(this.multer.single(multer));
            }
            else {
                middlewares.push(this.multer.array(multer.fieldName, multer.maxCount));
            }
        }
        return middlewares;
    }
    getHandler({ path, f, requiresAuth = false, custom = [] }) {
        const middlewares = this.setMiddlewares({ requiresAuth, custom });
        this.router.get(path, middlewares, (0, controllerFunctionWrapper_1.cfw)(f));
        return this;
    }
    postHandler({ path, f, requiresAuth = false, multer = undefined, custom = [] }) {
        const middlewares = this.setMiddlewares({
            requiresAuth,
            multer,
            custom
        });
        this.router.post(path, middlewares, (0, controllerFunctionWrapper_1.cfw)(f));
        return this;
    }
    patchHandler({ path, f, requiresAuth = false, multer = undefined, custom = [] }) {
        const middlewares = this.setMiddlewares({
            requiresAuth,
            multer,
            custom
        });
        this.router.patch(path, middlewares, (0, controllerFunctionWrapper_1.cfw)(f));
        return this;
    }
    deleteHandler({ path, f, requiresAuth = false, custom = [] }) {
        const middlewares = this.setMiddlewares({ requiresAuth, custom });
        this.router.delete(path, middlewares, (0, controllerFunctionWrapper_1.cfw)(f));
        return this;
    }
}
exports.RouterWrapper = RouterWrapper;
