import { Request, Response } from "express";
import { CacheRepository } from "../../../../core/infra/repositories/cache.repository";
import {
  DataNotFoundError,
  HttpRequest,
  HttpResponse,
  MvcController,
  notFound,
  ok,
  serverError,
} from "../../../../core/presentation";
import LoginRepository from "../../infra/repositories/login.repository";

export default class LoginController implements MvcController {
  readonly #repository: LoginRepository;
  readonly #cache: CacheRepository

  constructor(repository: LoginRepository, cache: CacheRepository) {
    this.#repository = repository;
    this.#cache = cache;
  }

  public async index() : Promise<HttpResponse>{
    try {
      //verifico se existe no cache
      const cache = await this.#cache.get("logins:all");
      //valido se exite cache
      if(cache) {
        return ok(cache.map((login: any) => Object.assign({}, login, {cache: true})));
      }

      const logins = await this.#repository.getLogins();

      await this.#cache.set("logins:all", logins);

      return ok(logins);
    } catch (error) {
      return serverError();
    }
  }

 async delete(request: HttpRequest): Promise<HttpResponse> {
    const { uid } = request.params;

    try {
      const result = await this.#repository.delete(uid);

      await this.#cache.del('logins:all');
      await this.#cache.del(`login:${uid}`);

      return ok(result);
    } catch (error) {
      return serverError();
    }
  }
  
  async update(request: HttpRequest): Promise<HttpResponse> {
    const { uid } = request.params;

    try{
      const result = await this.#repository.update(uid, request.body);

      await this.#cache.del("logins:all");
      await this.#cache.del(`login:${uid}`);
      return ok(result);

    }catch (error){
      return serverError();
    }
  }

  async store(request: HttpRequest): Promise<HttpResponse> {
    try {
      const result = await this.#repository.create(request.body);

      this.#cache.del("logins:all");
      return ok(result);
      
    } catch (error) {
      console.log(error)
      return serverError();
    }
  }

  public async show(request: HttpRequest){
    const { email, password  } = request.body;

    try {
      // consulto o cache
      const cache = await this.#cache.get(`login:${email}`);
      if (cache) {
        return ok(Object.assign({}, cache, { cache: true }));
      }

      const login = await this.#repository.getLogin(email,password);
      if (!login) {
        return notFound(new DataNotFoundError());
      }

      await this.#cache.set(`login:${email}`, login);

      return ok(login);
    } catch (error) {
      return serverError();
    }
  }
}

