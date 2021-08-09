import { compareSync } from "bcrypt";
import express, { Request, Response, Router } from "express";
import cors from "cors";
import LoginRoutes from "../../features/login/presentation/routes";
import RecadoRoutes from "../../features/recado/presentation/routes";


export default class App {
  readonly #express: express.Application;

  constructor() {
    this.#express = express();
  }

  public get server(): express.Application {
    return this.#express;
  }

  public init(): void {
    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.#express.use(express.json());
    this.#express.use(express.urlencoded({ extended: false }));
    this.#express.use(cors());
  }

  private routes(): void {
    const router = Router();

    this.#express.get("/", (_: Request, res: Response) => res.redirect("/api"));
    this.#express.use("/api", router);

    router.get("/", (_: Request, res: Response) => res.send("API RUNNING..."));

    const loginRoutes = new LoginRoutes().init();
    this.#express.use(loginRoutes);
    

    const recadoRoutes = new RecadoRoutes().init();
    this.#express.use(recadoRoutes);

    
  }

  public start(port: number): void {
    this.#express.listen(port, () =>
      console.log(`Server is running on ${port}`)
    );
  }
}
