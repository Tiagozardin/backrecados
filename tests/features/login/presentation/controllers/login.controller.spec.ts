
import { DataNotFoundError, HttpRequest, notFound, ok, serverError } from "../../../../../src/core/presentation";
import { v4 as uuid } from 'uuid';
import { DeleteResult } from "typeorm";
import LoginController from "../../../../../src/features/login/presentation/controllers/login.controller";
import LoginRepository from "../../../../../src/features/login/infra/repositories/login.repository";
import { CacheRepository } from "../../../../../src/core/infra/repositories/cache.repository";

const makeSut = (): LoginController => new LoginController(new LoginRepository(), new CacheRepository());

const makeRequestStore = (): HttpRequest => ({
    body: {
        email: "any_email",
        password: "any_password",
    },
    params: {},
});

const makeLoginResult = () => ({
    id: "any_id",
    email: "any_email",
    password: "any_password",
});

const makeRequestId = (): HttpRequest => ({
    params: { id: "any_id" },
    body: {},
});

const makeRequestUpdate = (): HttpRequest => ({
    body: {
        email: "any_email",
        password: "any_password"
    },
    params: {id: "any_id"}
});

const makeDeleteResult = (): DeleteResult => {
    return {
        raw: "any_raw",
        affected: 1 | 0
    };
}

describe("Login Controller", () => {
    describe("Store", () => {
        test("Deveria retornar status 500 se houver erro", async () => {
            jest.spyOn(LoginRepository.prototype, "create").
            mockRejectedValue(new Error());

            const sut = makeSut();
            const result = await sut.store(makeRequestStore());
            expect(result).toEqual(serverError());
        });

        test("Deveria chamar o Repositorio com valores corretos", async () => {
            const createSpy = jest.spyOn(LoginRepository.prototype, "create")
                .mockResolvedValue(makeRequestStore().body);

            const delSpy = jest.spyOn(CacheRepository.prototype, "del")
                .mockResolvedValue(true);

            const sut = makeSut();
            const data = makeRequestStore()
            await sut.store(data);

            expect(delSpy).toHaveBeenCalledWith("logins:all");
            expect(createSpy).toHaveBeenCalledWith(makeRequestStore().body);
        });

        test("Deveria apagar o cache do redis", async () => {
            const delSpy = jest.spyOn(CacheRepository.prototype, "del")
                .mockResolvedValue(true);

            const sut = makeSut();
            const data = makeRequestStore();
            await sut.store(data);

            expect(delSpy).toHaveBeenCalledWith("logins:all")
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
            
            jest.spyOn(LoginRepository.prototype, "getLogin")
            .mockResolvedValue(undefined);

            const sut = makeSut();
            const result = await sut.show(makeRequestId());

            expect(result).toEqual(notFound(new DataNotFoundError()));
        });

        test("Deveria retornar o usuario com status 200", async () => {
            const getSpy = jest.spyOn(CacheRepository.prototype, "get").mockResolvedValue(null);
            const setSpy = jest.spyOn(CacheRepository.prototype, "set").mockResolvedValue(null);

            jest.spyOn(LoginRepository.prototype, "getLogin")
            .mockResolvedValue(makeLoginResult());

            const sut = makeSut();
            const result = await sut.show(makeRequestId());

            expect(result).toEqual(ok(makeLoginResult()));
        });

        test("Deveria retornar 200 se o projeto existir em cache", async () => {
            const getSpy = jest.spyOn(CacheRepository.prototype, "get")
            .mockResolvedValue(makeLoginResult());

            const sut = makeSut();
            const result = await sut.show(makeRequestId());

            expect(result).toEqual(ok(Object.assign({}, makeLoginResult(), {cache: true})));
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


        test("Deveria retornar status 200 e a lista de usuario no cache", async () => {
            const getSpy = jest.spyOn(CacheRepository.prototype, "get")
            .mockResolvedValue([makeLoginResult()]);

            const sut = makeSut();
            const result = await sut.index();

            expect(result).toEqual(
                ok([Object.assign({}, makeLoginResult(), {cache: true})])
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
            
            jest.spyOn(LoginRepository.prototype, "delete")
                .mockResolvedValue(makeDeleteResult())

            const sut = makeSut();
            const result = await sut.delete(makeRequestId());

            expect(result).toStrictEqual(ok(makeDeleteResult()))
            expect(delSpy).toHaveBeenCalledWith("logins:all");
        });
    });
});