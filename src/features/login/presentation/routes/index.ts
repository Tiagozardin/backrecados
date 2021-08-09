import { error } from "console";
import { Router } from "express";
import { CacheRepository } from "../../../../core/infra/repositories/cache.repository";
import { EMvc, middlewareAdapter, MvcController, routerMvcAdapter } from "../../../../core/presentation";
import LoginRepository from "../../infra/repositories/login.repository";
import LoginController from "../controllers/login.controller";
import { LoginMiddleware } from "../middlewares";



const makeController = (): MvcController => {
    const repository = new LoginRepository();
    const cache = new CacheRepository();
    return new LoginController(repository, cache);
  };

export default class LoginRoutes {
    public init(): Router {
        const routes = Router();


        routes.post(
            "/login", 
            middlewareAdapter(new LoginMiddleware()),
            routerMvcAdapter(makeController(), EMvc.SHOW));

        routes.post(
            "/createLogin", 
            routerMvcAdapter(makeController(), EMvc.STORE));


        return routes;

    }
}