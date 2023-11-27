# RouterWrapperJS
<p align="center">
  <img src="https://img.shields.io/github/package-json/v/islamaf/router-wrapper-js">
  <img src="https://img.shields.io/librariesio/release/npm/router-wrapper-js">
  <img src="https://img.shields.io/npm/dm/router-wrapper-js">
  <img src="https://img.shields.io/github/license/islamaf/router-wrapper-js">
  <img src="https://img.shields.io/github/contributors/islamaf/router-wrapper-js">
  <img src="https://img.shields.io/github/last-commit/islamaf/router-wrapper-js">
</p>

**RouterWrapperJS** is a wrapper for backend frameworks routes, making them more compact with better chaining. Abstracting middlewares and other functions.

Currently supported frameworks:
* Express
* Fastify

# Getting Started
### Install RouterWrapperJS via npm:
```shell
npm i router-wrapper-js
```
### Install RouterWrapperJS via yarn:
```shell
yarn add router-wrapper-js
```

### Usage
The basic structure for route params:
* Express
    ```ts
    {
        path: string;
        handler: Function; // Controller function
        middleware?: any[]; // Middlewares
    }
    ```
* Fastify
    ```ts
    {
        path: string;
        handler: Function; // Controller function
        schema?: {};
        preHandler?: any[]; // Middlewares
    }
    ```

### Usage with Express
An example of express router wrapper usage:
```ts
import express, { Request } from "express";
import { ExpressRouterWrapper } from "router-wrapper-js";

const app = express();

const router = new ExpressRouterWrapper({ auth?: YOUR_AUTH_MIDDLEWARE })
    .get({
        path: "/", 
        handler: async () => await homeController(),
        middleware: [MIDDLWARE_1, MIDDLWARE_2, MIDDLWARE_3]
    })
    .protectedGet({
        path: "/user", 
        handler: async (req: Request) => await userController(req),
        middleware: [MIDDLWARE_1, MIDDLWARE_2, MIDDLWARE_3]
    })
    .post({
        path: "/user", 
        handler: async (req: Request) => await newUserController(req)
    })
    .protectedPost({
        path: "/book", 
        handler: async (req: Request) => await newBookController(req)
    })
    .patch({
        path: "/user", 
        handler: async (req: Request) => await editUserController(req)
    })
    .protectedPatch({
        path: "/book", 
        handler: async (req: Request) => await editBookController(req)
    })
    .delete({
        path: "/user/:id", 
        handler: async (req: Request) => await deleteUserController(req)        
    })
    .protectedDelete({
        path: "/book/:id", 
        handler: async (req: Request) => await deleteBookController(req)
    })
    .make();

app.use("/", router);

app.listen(5000);
```

### Usage with Fastify
An example of fastify router wrapper usage:
```ts
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import { FastifyRouterWrapper } from "router-wrapper-js";

const fastify = Fastify();

const route = new FastifyRouterWrapper(fastify, { auth?: YOUR_AUTH_MIDDLEWARE })
    .get({
        path: "/", 
        handler: async () => await homeController(),
        preHandler: [MIDDLWARE_1, MIDDLWARE_2, MIDDLWARE_3]
    })
    .protectedGet({
        path: "/user", 
        handler: async (req: FastifyRequest, reply: FastifyReply) => await userController(req),
        preHandler: [MIDDLWARE_1, MIDDLWARE_2, MIDDLWARE_3]
    })
    .post({
        path: "/user", 
        handler: async (req: FastifyRequest, reply: FastifyReply) => await newUserController(req),
        schema: userSchema
    })
    .protectedPost({
        path: "/book", 
        handler: async (req: FastifyRequest, reply: FastifyReply) => await newBookController(req),
        schema: bookSchema,
        preHandler: [MIDDLEWARE_1, MIDDLEWARE_2]
    })
    .patch({
        path: "/user", 
        handler: async (req: FastifyRequest, reply: FastifyReply) => await editUserController(req)
    })
    .protectedPatch({
        path: "/book", 
        handler: async (req: FastifyRequest, reply: FastifyReply) => await editBookController(req)
    })
    .delete({
        path: "/user/:id", 
        handler: async (req: FastifyRequest, reply: FastifyReply) => await deleteUserController(req)        
    })
    .protectedDelete({
        path: "/book/:id", 
        handler: async (req: FastifyRequest, reply: FastifyReply) => await deleteBookController(req)
    })
    .make();

fastify.register(route);

fastify.listen({ port: 5000 });
```

# Sharing Middleware
Sharing middleware in both Express and Fastify router wrappers, allows middleware to be applied for some routes which are in the ```shared middleware``` array and ignoring routes not in the array. Usage example:

### With Express
```ts
const router = new ExpressRouterWrapper(
    { auth: AUTH },
    [SHARED_MIDDLEWARE_1, SHARED_MIDDLEWARE_2, ..., SHARED_MIDDLEWARE_N] // Shared middleware
)
    /**
     * Routes which share middleware
     * Here, only GET /user route will have shared middleware applied to it
     * While PATCH /user and GET /user/data will not have the shared middleware
     */
    .shareTo(["GET /user"]) 
    .get({
        path: "/user",
        handler: async (req: Request) => await userController(req)
    })
    .patch({
        path: "/user",
        handler: async (req: Request) => await editUserController(req),
        middleware: [MIDDLEWARE]
    })
    .protectedGet({
        path: "/user/data",
        handler: async (req: Request) => await userDataController(req),
        middleware: [MIDDLEWARE]
    })
    .make();
```

### With Fastify
```ts
const routes = new FastifyRouterWrapper(fastify, { auth }, [
    SHARED_MIDDLEWARE_1, SHARED_MIDDLEWARE_2, ..., SHARED_MIDDLEWARE_N
])
    .shareTo(["GET /user"])
    .protectedGet({
        path: "/user",
        handler: async (request: FastifyRequest, reply: FastifyReply) => await userController(req),
        preHandler: [PREHANDLERS]
    })
    .patch({
        path: "/book",
        handler: async (request: FastifyRequest, reply: FastifyReply) => await bookController(req),
        preHandler: [PREHANDLERS]
    })
    .make();
```


# Controller Handler
The router wrapper has an internal controller handler wrapper for both the Express and Fastify. Basically wrapping the controller function passed to the route function. The format of the expected returned ```data``` object from the controller function in your ```app``` is supposed to look like this:
```ts
{
    status: number, // Status code of the operation
    success: boolean, // Success state of the operation
    data: {} // Data returned from the operation
}
```

### Example
Taking the ```newUserController()``` as an example:
```ts
const newUserController = async (req: Request) => {
    const res = await addNewUserService(req)

    return {
        status: res.status,
        success: res.success,
        data: res.data
    }
}
```

# Open to contributors
To add a middleware which might be useful in general use with the router wrapper, kindly, make a pull request with your extended implementation.  
Also, looking forward to extend the wrapping beyond ExpressJs and Fastify to include router wrapping for other JS backend frameworks!

Thank you:)

# License
[MIT](LICENSE)