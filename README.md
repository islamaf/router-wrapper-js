# Express Router Wrapper
A wrapper for express routes, making them more compact with better chaining. Abstracting middlewares and other functions.

Currently supported middleware:
* Multer

However, you can simply append your custom middleware to a route by adding it to the `custom` array in each route. Examples are supported below.

# Getting Started
The basic structure for the GET and DELETE methods:
```
// GET METHOD
.get("/", async () => await homeController(), [CUSTOM_MIDDLEWARES])

// DELETE METHOD
.delete("/user/:id", async () => await deleteUserController(), [CUSTOM_MIDDLEWARES])
```
While for the rest of the methods:
```
// POST METHOD
.post("/user", async (req: Request) => await newUserController(req), { 
    multer: "image" 
}, [CUSTOM_MIDDLEWARES])

// PATCH METHOD
.patch("/user", async (req: Request) => await editUserController(req), { 
    multer: "image" 
}, [CUSTOM_MIDDLEWARES])
```

An example of wrapping a router with all its methods:  
```
import express, { Request } from "express";
import { RouterWrapper } from "express-router-wrapper";

const app = express();

const router = new RouterWrapper({ auth?: YOUR_AUTH_MIDDLEWARE, multer?: MULTER })
    .get("/", async () => await homeController())
    .protectedGet("/user", async (req: Request) => await userController(req))
    .post("/user", async (req: Request) => await newUserController(req), { multer: "image" })
    .protectedPost("/book", async (req: Request) => await newBookController(req), { multer: { 
        fieldName: "images", 
        maxCount: 5 
    }})
    .patch("/user", async (req: Request) => await editUserController(req))
    .protectedPatch("/book", async (req: Request) => await editBookController(req), [
        CUSTOM_MIDDLWARE_1, CUSTOM_MIDDLEWARE_2, ..., CUSTOM_MIDDLEWARE_N
    ])
    .delete("/user/:id", async (req: Request) => await deleteUserController(req))
    .protectedDelete("/book/:id", async (req: Request) => await deleteBookController(req))
    .make();

app.use("/", router);

app.listen(5000);
```

# Using Multer as route Middleware
Just as how you would do it with normal Multer usage, here, the middleware is set depending on the Multer params passed to the route function.  
* For passing array of images:  
```
.post("/book", async (req: Request) => await newBookController(req), { multer: {
    fieldName: "images",
    maxCount: 5
}}) 
```
* For passing a single image:  
```
.post("/user", async (req: Request) => await newUserController(req), { multer: "image" })
```
* For passing fields:
```
.post("/book", async (req: Request) => await newBookController(req), { multer: [
    { name: "cover", maxCount: 1 },
    { name: "back", maxCount: 1 }
]})
```

# Using Custom Middleware
Usins a custom middleware for a route can be done by adding an array of the needed custom middlewares as the last parameter for the route function.
```
.protectedPatch("/book", async (req: Request) => await editBookController(req), {
        multer: [
            { name: "cover", maxCount: 1 },
            { name: "back", maxCount: 1 }
        ]
    }, [
        CUSTOM_MIDDLWARE_1, CUSTOM_MIDDLEWARE_2, ..., CUSTOM_MIDDLEWARE_N
    ]
)
```

# Open to contributors
To add a middleware which might be useful in general use with the express router wrapper, kindly, make a pull request with your extended implementation. 

Thank you:)

# License
[MIT](LICENSE)