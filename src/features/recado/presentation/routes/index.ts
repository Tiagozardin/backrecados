import { Router } from "express";
import { CacheRepository } from "../../../../core/infra/repositories/cache.repository";
import { EMvc, middlewareAdapter, MvcController, routerMvcAdapter } from "../../../../core/presentation";
import RecadoRepository from "../../infra/repositories/recado.repository";
import RecadoController from "../controllers/recado.controller";

const makeController = (): MvcController => {
    const repository = new RecadoRepository();
    const cache = new CacheRepository();
    return new RecadoController(repository, cache);
  };

export default class RecadoRoutes {
    public init(): Router {
        const routes = Router();

       
        routes.get("/recado", routerMvcAdapter(makeController(), EMvc.INDEX));
        routes.get("/recado/:id", routerMvcAdapter(makeController(), EMvc.SHOW));

        routes.post(
            "/recado", 
            routerMvcAdapter(makeController(), EMvc.STORE));

        routes.put(
            "/recado/:id",
            routerMvcAdapter(makeController(), EMvc.UPDATE));

        routes.delete(
            "/recado/:id",
            routerMvcAdapter(makeController(), EMvc.DELETE));

        return routes;

    }
}