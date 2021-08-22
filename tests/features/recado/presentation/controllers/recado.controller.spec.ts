
import { DataNotFoundError, HttpRequest, notFound, ok, serverError } from "../../../../../src/core/presentation";
import { DeleteResult } from "typeorm";
import RecadoController from "../../../../../src/features/recado/presentation/controllers/recado.controller";
import RecadoRepository from "../../../../../src/features/recado/infra/repositories/recado.repository";
import { CacheRepository } from "../../../../../src/core/infra/repositories/cache.repository";


const makeSut = (): RecadoController => new RecadoController(new RecadoRepository(), new CacheRepository());

const makeRequestStore = (): HttpRequest => ({
    body: {
        titulo: "any_titulo",
        descricao: "any_descricao",
    },
    params: {},
});

const makeRecadoResult = () => ({
    id: "any_id",
    titulo: "any_titulo",
    descricao: "any_descricao",
    loginId: "any_loginid"
});

const makeRequestId = (): HttpRequest => ({
    params: { id: "any_id" },
    body: {},
});

const makeRequestUpdate = (): HttpRequest => ({
    body: {
        titulo: "any_titulo",
        descricao: "any_descricao"
    },
    params: {id: "any_id"}
});

const makeDeleteResult = (): DeleteResult => {
    return {
        raw: "any_raw",
        affected: 1 | 0
    };
}

describe("login Controller", () => {
    describe("Store", () => {
        test("Deveria retornar status 500 se houver erro", async () => {
            jest.spyOn(RecadoRepository.prototype, "create").
            mockRejectedValue(new Error());

            const sut = makeSut();
            const result = await sut.store(makeRequestStore());
            expect(result).toEqual(serverError());
        });

        test("Deveria chamar o Repositorio com valores corretos", async () => {
            const createSpy = jest.spyOn(RecadoRepository.prototype, "create")
                .mockResolvedValue(makeRecadoResult());

            const delSpy = jest.spyOn(CacheRepository.prototype, "del")
                .mockResolvedValue(true);

            const sut = makeSut();
            const data = makeRequestStore()
            await sut.store(data);

            expect(delSpy).toHaveBeenCalledWith("recado:all");
            expect(createSpy).toHaveBeenCalledWith(makeRequestStore().body);
        });

        test("Deveria apagar o cache do redis", async () => {
            const delSpy = jest.spyOn(CacheRepository.prototype, "del")
                .mockResolvedValue(true);

            const sut = makeSut();
            const data = makeRequestStore();
            await sut.store(data);

            expect(delSpy).toHaveBeenCalledWith("recado:all")
        });
    });

    describe("Show", () => {
        test("Deveria retornar status 500 se houver erro", async () => {
            jest.spyOn(CacheRepository.prototype, "get").
            mockRejectedValue(new Error());

            const sut = makeSut();
            const result = await sut.show(makeRequestId());
            expect(result).toEqual(serverError());
        });

        test("Deveria retornar status 404 se o usuario não existir", async () => {
            jest.spyOn(CacheRepository.prototype, "get").mockResolvedValue(null);
            
            jest.spyOn(RecadoRepository.prototype, "getRecado")
            .mockResolvedValue(undefined);

            const sut = makeSut();
            const result = await sut.show(makeRequestId());

            expect(result).toEqual(notFound(new DataNotFoundError()));
        });

        test("Deveria retornar o usuario com status 200", async () => {
            const getSpy = jest.spyOn(CacheRepository.prototype, "get").mockResolvedValue(null);
            const setSpy = jest.spyOn(CacheRepository.prototype, "set").mockResolvedValue(null);

            jest.spyOn(RecadoRepository.prototype, "getRecado")
            .mockResolvedValue(makeRecadoResult());

            const sut = makeSut();
            const result = await sut.show(makeRequestId());

            expect(result).toEqual(ok(makeRecadoResult()));
            expect(getSpy).toHaveBeenCalledWith(`recado:${makeRecadoResult().id}`)
            expect(setSpy).toHaveBeenCalledWith(
                `recado:${makeRecadoResult().id}`, makeRecadoResult()
            );
        });

        test("Deveria retornar 200 se o projeto existir em cache", async () => {
            const getSpy = jest.spyOn(CacheRepository.prototype, "get")
            .mockResolvedValue(makeRecadoResult());

            const sut = makeSut();
            const result = await sut.show(makeRequestId());

            expect(result).toEqual(ok(Object.assign({}, makeRecadoResult(), {cache: true})));

            expect(getSpy).toHaveBeenLastCalledWith(
                `recado:${makeRecadoResult().id}`
              );
        });
    });

    describe("Index", () => {
        test("Deveria retornar erro 500", async () => {
            jest
            .spyOn(CacheRepository.prototype, "get")
            .mockRejectedValue(new Error());

            
            const sut = makeSut();
            const result = await sut.index();
            expect(result).toEqual(serverError());
        });

        test("Deveria retornar a lista de usuários", async () => {         

            const getSpy = jest.spyOn(CacheRepository.prototype, "get")
            .mockResolvedValue(null);

            const setSpy = jest.spyOn(CacheRepository.prototype, "set")
            .mockResolvedValue(null);

            const sut = makeSut();
            const result = await sut.index();

            expect(result).toStrictEqual(ok([makeRecadoResult()]))
            expect(getSpy).toHaveBeenCalledWith("recado:all");
            expect(setSpy).toHaveBeenCalledWith("recado:all", [makeRecadoResult()]);
        });

        test("Deveria retornar status 200 e a lista de usuario no cache", async () => {
            const getSpy = jest.spyOn(CacheRepository.prototype, "get")
            .mockResolvedValue([makeRecadoResult()]);

            const sut = makeSut();
            const result = await sut.index();

            expect(result).toEqual(
                ok([Object.assign({}, makeRecadoResult(), {cache: true})])
            )
        });
    });

    describe("Update", () => {
        test("Deveria retornar erro 500", async () => {
            jest
            .spyOn(CacheRepository.prototype, "del")
            .mockRejectedValue(new Error());

            
            const sut = makeSut();
            const result = await sut.update(makeRequestUpdate());
            expect(result).toEqual(serverError());
        });

        test("Deveria ediatr um usuario e retornar com stastus 200", async () => {
            const delSpy = jest.spyOn(CacheRepository.prototype, "del")
                .mockResolvedValue(true);
            
            jest.spyOn(RecadoRepository.prototype, "update")
                .mockResolvedValue(makeRecadoResult());
            
            const sut = makeSut();
            const result = await sut.update(makeRequestUpdate());

            expect(result).toStrictEqual(ok(makeRecadoResult()))
            expect(delSpy).toHaveBeenCalledWith("recado:all");
            expect(delSpy).toHaveBeenCalledWith(`recado:${makeRecadoResult().id}`);
        });
    });

    describe("Delete", () => {
        test("Deveria retornar erro 500", async () => {
            jest
            .spyOn(CacheRepository.prototype, "del")
            .mockRejectedValue(new Error());

            
            const sut = makeSut();
            const result = await sut.delete(makeRequestId());
            expect(result).toEqual(serverError());
        });

        test("Deveria excluir um usuario e retornar com stastus 200", async () => {
            const delSpy = jest.spyOn(CacheRepository.prototype, "del")
                .mockResolvedValue(true);
            
            jest.spyOn(RecadoRepository.prototype, "delete")
                .mockResolvedValue(makeDeleteResult())

            const sut = makeSut();
            const result = await sut.delete(makeRequestId());

            expect(result).toStrictEqual(ok(makeDeleteResult()))
            expect(delSpy).toHaveBeenCalledWith("recado:all");
            expect(delSpy).toHaveBeenCalledWith(`recado:${makeRecadoResult().id}`);
        });
    });
});