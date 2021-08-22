import App from "../../../../../src/core/presentation/app";
import { LoginEntity } from "../../../../../src/core/infra";
import Database from "../../../../../src/core/infra/data/connections/database";
import express, { Router } from "express";
import request from "supertest";
import IORedis from "ioredis";
import { v4 as uuid } from 'uuid';
import LoginRoutes from "../../../../../src/features/login/presentation/routes";


jest.mock("ioredis");

const makeLoginsDB = async (): Promise<LoginEntity[]> => {
    const loginA = await LoginEntity.create({
        email: "any_emailA",
        password: "any_password"
    }).save();

    const loginB = await LoginEntity.create({
        email: "any_emailB",
        password: "any_password"
    }).save();

    return [loginA, loginB];
}

const makeLoginDB = async (): Promise<LoginEntity> => {
    return await LoginEntity.create({
        email: "any_email",
        password: "any_password"
    }).save();
}

describe("Login routes", () => {
    const server = new App().server;

    beforeAll(async () => {
        await new Database().openConnection();
        const router = Router();
        server.use(express.json());
        server.use(router);

        new LoginRoutes().init()
    });

    beforeEach(async () => {
        await LoginEntity.clear();
        jest.resetAllMocks();
    });

    describe("/POST", () => {
        test("Deveria retornar status 400 ao tentrar salvar um usuario sem email", async () => {
                await request(server).post("/createLogin")
                .send({
                    password: "any_password",
                }).expect(400, { error: 'Missing param: email' });
        });

        test("Deveria retornar status 400 ao tentrar salvar um usuario sem password", async () => {
            await request(server).post("/createLogin")
            .send({
                email: "any_email",
                confirmPassword: "any_password"
            }).expect(400, { error: 'Missing param: password' });
        });

        test("Deveria retornar status 400 ao tentrar salvar um usuario sem confirmPassword", async () => {
            await request(server).post("/createLogin")
            .send({
                email: "any_email",
                password: "any_password"
            }).expect(400, { error: 'Missing param: confirmPassword' });
        });

        test("Deveria retornar status 400 quando as duas senhas nao coincidem", async () => {
            await request(server).post("/createLogin")
            .send({
                email: "any_email",
                password: "any_password",
                confirmPassword: "any_paswword"
            }).expect(400, { error: 'Invalid param: confirmPassword' });
        });

        test("Deveria retornar status 400 quando já existir um usuário com o mesmo email", async () => {
            await makeLoginDB();

            await request(server).post("/createLogin")
            .send({
                email: "any_email",
                password: "any_password",
                confirmPassword: "any_password"
            }).expect(400, { error: 'User already exists with these data' });
        });

        test("Deveria retornar 200 quando salvar o usuário", async () => {
            await request(server)
              .post("/createLogin")
              .send({
                email: "any_email",
                password: "any_password",
                confirmPassword: "any_password"
              })
              .expect(200)
              .expect((res) => {
                expect(res.body.uid).toBeTruthy();
                expect(res.body.email).toBe("any_email");
                expect(res.body.password).toBe("any_password");
              });
          });
    });

    

});