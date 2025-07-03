import { Router, Express } from "express";
import AuthRouter from "./auth-route";
import UserRouter from "./user-route";
import { authMiddleware } from "../middleware/authmiddleware";


const baseUrl = "/api/v1/";

const routes = [
    { path: `${baseUrl}auth`, router: AuthRouter, userToken: false },
    { path: `${baseUrl}user`, router: UserRouter, userToken: true }
];

const applyRouters = async (app: Express) => {
    routes.map((route) => {
        if (route.userToken) {
            app.use(route.path, authMiddleware, route.router);
        } else {
            app.use(route.path, route.router);
        }
    });
};

export default applyRouters;