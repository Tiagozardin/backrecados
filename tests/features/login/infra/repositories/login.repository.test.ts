import { LoginEntity } from '../../../../../src/core/infra';
import Database from '../../../../../src/core/infra/data/connections/database';
import { v4 as uuid } from 'uuid';
import LoginRepository from '../../../../../src/features/login/infra/repositories/login.repository';
import { Login } from '../../../../../src/features/login/domain/models';

const makeCreateParams = async (): Promise<Login> => {
    return {
        email: "any_email",
        password: "any_password",
    };
};

const makeLoginsDB = async (): Promise<LoginEntity[]> => {
    const loginA = await LoginEntity.create({
        id: "any_id",
        email: "any_emailA",
        password: "any_password",
    }).save();

    const loginB = await LoginEntity.create({
        id: "any_id",
        email: "any_emailB",
        password: "any_password",
    }).save();

    return [loginA, loginB];
};

const makeLoginDB = async (): Promise<LoginEntity> => {
    return await LoginEntity.create({
        email: "any_emailA",
        password: "any_password"
    }).save();
};


describe("Login Repository", () => {
    beforeAll(async () => {
        await new Database().openConnection();
    });

    beforeEach(async () => {
        await LoginEntity.clear()
    });

    afterAll(async () => {
        await new Database().disconnectDatabase();
    });

    describe("create", () => {
        test("Deveria retornar um login quando obtiver sucesso", async () => {
          const sut = new LoginRepository();
          const params = await makeCreateParams();
          const result = await sut.create(params);
    
          expect(result).toBeTruthy();
          expect(result.id).toBeTruthy();
          expect(result.email).toBe("any_email");
          expect(result.password).toBe("any_password");
        });
    });

    describe("Get Logins", () => {
        test("Deveria retornar uma lista de usuários", async () => {
            const sut = new LoginRepository();
            const logins = await makeLoginsDB();
            const result = await sut.getLogins();

            expect(result).toBeTruthy();
            expect(result.length).toBe(logins.length);
        });
    });

    describe("Get Login", () => {
      
        test("Deveria retornar um usuário quando obtiver um UID válido", async () => {
            const sut = new LoginRepository();
            const login = await makeLoginDB();

            const result = await sut.getLogin(login.email,login.password);

            expect(result).toBeTruthy();
            expect(result?.email).toBe(login.email);
            expect(result?.password).toBe(login.password);
        });
    });
});
