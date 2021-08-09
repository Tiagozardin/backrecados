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
import RecadoRepository from "../../infra/repositories/recado.repository";


export default class RecadoController implements MvcController {
  readonly #repository: RecadoRepository;
  readonly #cache: CacheRepository

  constructor(repository: RecadoRepository, cache: CacheRepository) {
    this.#repository = repository;
    this.#cache = cache;
  }

  public async index() {
    try {
      //verifico se existe no cache
      const cache = await this.#cache.get("recado:all");

      //valido se exite cache
      if(cache) {
        return ok(cache.map((recado: any) => Object.assign({}, recado, {cache: true})));
      }

      const recados = await this.#repository.getRecados();

      await this.#cache.set("recado:all", recados);

      return ok(recados);
    } catch (error) {
      return serverError();
    }
  }

 async delete(request: HttpRequest): Promise<HttpResponse> {
    const { id } = request.params;

    try {
      const result = await this.#repository.delete(id);
      await this.#cache.del("recado:all");
      await this.#cache.del(`recado:${id}`);
      
      return ok(result);
    } catch (error) {
      return serverError();
    }
  }
  
  async update(request: HttpRequest): Promise<HttpResponse> {
    const { id } = request.params;

    try{
      const result = await this.#repository.update(id, request.body);
      await this.#cache.del("recado:all");
      await this.#cache.del(`recado:${id}`);


      return ok(result);

    }catch (error){
      return serverError();
    }
  }

  async store(request: HttpRequest): Promise<HttpResponse> {
    try {
      const result = await this.#repository.create(request.body);

      await this.#cache.del("recado:all");

      return ok(result);
    } catch (error) {
      return serverError();
    }
  }

  async show(request: HttpRequest): Promise<HttpResponse> {
    const { id } = request.params;

    try {
      // consulto o cache
      const cache = await this.#cache.get(`recado:${id}`);
      if (cache) {
        return ok(Object.assign({}, cache, { cache: true }));
      }

      const recado = await this.#repository.getRecado(id);
      if (!recado) {
        return notFound(new DataNotFoundError());
      }

      await this.#cache.set(`recado:${id}`, recado);

      return ok(recado);
    } catch (error) {
      return serverError();
    }
  }
}

