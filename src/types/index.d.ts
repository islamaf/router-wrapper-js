import { Router } from "express";
import { Field, Multer } from "multer";

declare module "router-wrapper-js" {
    export type Handler = {
        path: string;
        f: Function;
        custom?: any[];
    };
    export type RequiresAuth = {
        requiresAuth?: boolean;
    };
    export type MulterParam =
        | Field[]
        | string
        | { fieldName: string; maxCount?: number };
    export type Get = Handler & RequiresAuth;
    export type Post = Handler & RequiresAuth & { multer?: MulterParam };
    export type Patch = Handler & RequiresAuth & { multer?: MulterParam };
    export type Delete = Handler & RequiresAuth;
    export type Services = {
        multer?: Multer;
        auth?: any;
    };
    export type Options = {
        multer?: MulterParam;
    };
    export type Middlewares = {
        requiresAuth: boolean;
        multer?: MulterParam;
        custom?: any[];
    };
    export interface RouterWrapper {
        get(path: string, f: Function, custom?: any[]): RouterWrapper;
        protectedGet(path: string, f: Function, custom?: any[]): RouterWrapper;
        post(
            path: string,
            f: Function,
            options?: Options,
            custom?: any[]
        ): RouterWrapper;
        protectedPost(
            path: string,
            f: Function,
            options?: Options,
            custom?: any[]
        ): RouterWrapper;
        patch(
            path: string,
            f: Function,
            options?: Options,
            custom?: any[]
        ): RouterWrapper;
        protectedPatch(
            path: string,
            f: Function,
            options?: Options,
            custom?: any[]
        ): RouterWrapper;
        delete(path: string, f: Function, custom?: any[]): RouterWrapper;
        protectedDelete(
            path: string,
            f: Function,
            custom?: any[]
        ): RouterWrapper;
        make(): Router;
    }
}
