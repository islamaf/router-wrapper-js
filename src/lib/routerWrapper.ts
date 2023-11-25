import { Router } from "express";
import { Field, Multer } from "multer";
import { cfw } from "./controllerFunctionWrapper";

type Handler = {
    path: string;
    f: Function;
    custom?: any[];
};
type RequiresAuth = {
    requiresAuth?: boolean;
};
type MulterParam = Field[] | string | { fieldName: string; maxCount?: number };
type Get = Handler & RequiresAuth;
type Post = Handler & RequiresAuth & { multer?: MulterParam };
type Patch = Handler & RequiresAuth & { multer?: MulterParam };
type Delete = Handler & RequiresAuth;
type Services = {
    multer?: Multer;
    auth?: any;
};
type Options = {
    multer?: MulterParam;
};
type Middlewares = {
    requiresAuth: boolean;
    multer?: MulterParam;
    custom?: any[];
};
interface RouterWrapper {
    get(path: string, f: Function, custom?: any[]): this;
    protectedGet(path: string, f: Function, custom?: any[]): this;
    post(path: string, f: Function, options?: Options, custom?: any[]): this;
    protectedPost(
        path: string,
        f: Function,
        options?: Options,
        custom?: any[]
    ): this;
    patch(path: string, f: Function, options?: Options, custom?: any[]): this;
    protectedPatch(
        path: string,
        f: Function,
        options?: Options,
        custom?: any[]
    ): this;
    delete(path: string, f: Function, custom?: any[]): this;
    protectedDelete(path: string, f: Function, custom?: any[]): this;
    make(): Router;
}

/**
 * Router Wrapper class for wrapping express router to be more compact and chainable
 */
class RouterWrapper implements RouterWrapper {
    private router: Router;
    private multer: Multer | undefined;
    constructor(private services: Services = {}) {
        this.router = Router();
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
    get(path: string, f: Function, custom?: any[]) {
        return this.getHandler({ path, f, custom });
    }

    /**
     * Express GET method with authentication middleware
     * @param path String
     * @param f Controller function
     * @param custom Custom middleware
     * @returns Router Wrapper object
     */
    protectedGet(path: string, f: Function, custom?: any[]) {
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
    post(path: string, f: Function, options?: Options, custom?: any[]) {
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
    protectedPost(
        path: string,
        f: Function,
        options?: Options,
        custom?: any[]
    ) {
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
    patch(path: string, f: Function, options?: Options, custom?: any[]) {
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
    protectedPatch(
        path: string,
        f: Function,
        options?: Options,
        custom?: any[]
    ) {
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
    delete(path: string, f: Function, custom?: any[]) {
        return this.deleteHandler({ path, f, custom });
    }

    /**
     * Express DELETE method with authentication middleware
     * @param path String
     * @param f Controller function
     * @param custom Custom middleware
     * @returns Router Wrapper object
     */
    protectedDelete(path: string, f: Function, custom?: any[]) {
        return this.deleteHandler({ path, f, requiresAuth: true, custom });
    }

    /**
     * Make the router
     * @returns Express router
     */
    make() {
        return this.router;
    }

    private setMiddlewares({
        multer,
        custom,
        requiresAuth = false
    }: Middlewares) {
        let middlewares: any[] = custom ?? [];
        if (requiresAuth) {
            middlewares.push(this.services.auth);
        }

        if (this.multer && multer) {
            if (Array.isArray(multer)) {
                middlewares.push(this.multer.fields(multer));
            } else if (typeof multer === "string") {
                middlewares.push(this.multer.single(multer));
            } else {
                middlewares.push(
                    this.multer.array(multer.fieldName, multer.maxCount)
                );
            }
        }

        return middlewares;
    }

    private getHandler({ path, f, requiresAuth = false, custom = [] }: Get) {
        const middlewares = this.setMiddlewares({ requiresAuth, custom });
        this.router.get(path, middlewares, cfw(f));
        return this;
    }

    private postHandler({
        path,
        f,
        requiresAuth = false,
        multer = undefined,
        custom = []
    }: Post) {
        const middlewares = this.setMiddlewares({
            requiresAuth,
            multer,
            custom
        });
        this.router.post(path, middlewares, cfw(f));
        return this;
    }

    private patchHandler({
        path,
        f,
        requiresAuth = false,
        multer = undefined,
        custom = []
    }: Patch) {
        const middlewares = this.setMiddlewares({
            requiresAuth,
            multer,
            custom
        });
        this.router.patch(path, middlewares, cfw(f));
        return this;
    }

    private deleteHandler({
        path,
        f,
        requiresAuth = false,
        custom = []
    }: Delete) {
        const middlewares = this.setMiddlewares({ requiresAuth, custom });
        this.router.delete(path, middlewares, cfw(f));
        return this;
    }
}

export { RouterWrapper };
