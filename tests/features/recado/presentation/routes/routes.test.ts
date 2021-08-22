import App from "../../../../../src/core/presentation/app";
import Database from "../../../../../src/core/infra/data/connections/database";
import express, { Router } from "express";
import request from "supertest";
import IORedis from "ioredis";
import { v4 as uid } from 'uuid';
import { LoginEntity, RecadoEntity } from "../../../../../src/core/infra";
import RecadoRoutes from "../../../../../src/features/recado/presentation/routes/routes";

jest.mock("ioredis");

const makeLoginDB = async (): Promise<LoginEntity> => {
    return await LoginEntity.create({
        email: "any_email",
        password: "any_password",
    }).save();
}
const makeRecadosDB = async (): Promise<RecadoEntity[]> => {
    const login = await makeLoginDB();

    const NoteA = await RecadoEntity.create({
        titulo: "any_titulo",
        descricao: "any_descricao",
        loginID: login.id,
    }).save();

    const NoteB = await RecadoEntity.create({
        titulo: "any_titulo",
        descricao: "any_descricao",
        loginID: login.id,
    }).save();

    return [NoteA, NoteB];
}

const makeNoteDB = async (): Promise<RecadoEntity> => {
    const login = await makeLoginDB();

    return await RecadoEntity.create({
        titulo: "any_titulo",
        descricao: "any_descricao",
        loginID: login.id
    }).save();
}

describe("Notes routes", () => {
    const server = new App().server;

    beforeAll(async () => {
        await new Database().openConnection();
        const router = Router();
        server.use(express.json());
        server.use(router);

        new RecadoRoutes().init();
    });

    beforeEach(async () => {
        await LoginEntity.clear();
        await RecadoEntity.clear();
        jest.resetAllMocks();
    });


    describe("/GET:id", () => {
        test("Deveria retornar uma lista de recados", async () => {
            const notes = await makeRecadosDB();
        
            jest.spyOn(IORedis.prototype, "get").mockResolvedValue(null);
        
            await request(server)
              .get(`/notes/login/${notes[0].loginID}`).send().expect(200)
                .expect((res) => {
                    expect((res.body as []).length).toBe(notes.length);
                    expect(res.body[0].cache).toBeFalsy();
                });
        });

        test("Deveria retornar uma lista de recados - CACHE", async () => {
            const notes = await makeRecadosDB();
        
            jest.spyOn(IORedis.prototype, "get")
                .mockResolvedValue(JSON.stringify(notes));
        
            await request(server)
              .get(`/notes/login/${notes[0].loginID}`).send().expect(200)
                .expect((res) => {
                    expect((res.body as []).length).toBe(notes.length);
                    expect(res.body[0].cache).toBeTruthy();
                });
        });

        test("Deveria retorn erro 500", async () => {
            const notes = await makeRecadosDB();

            jest.spyOn(IORedis.prototype, "get").mockRejectedValue(null);

            await request(server).get(`/notes/login/${notes[0].loginID}`).send().expect(500);
        });

        test("Deveria retornar um recado para um id válido", async () => {
            const note = await makeNoteDB();

            jest.spyOn(IORedis.prototype, "get").mockResolvedValue(null);
            await request(server).get(`/notes/${note.id}`).send().expect(200)
                .expect((res) => {
                    expect(res.body.id).toBe(note.id);
                    expect(res.body.cache).toBeFalsy();
                });
        });

        test("Deveria retornar um recado para um id válido - cache", async () => {
            const note = await makeNoteDB();

            jest.spyOn(IORedis.prototype, "get").mockResolvedValue(JSON.stringify(note));
            await request(server).get(`/notes/${note.id}`).send().expect(200)
                .expect((res) => {
                    expect(res.body.id).toBe(note.id);
                    expect(res.body.cache).toBeTruthy();
                });
        });

        test("Deveria retornar 404 quando o recado não existir", async () => {
            jest.spyOn(IORedis.prototype, "get").mockResolvedValue(null);

            await request(server).get(`/notes/${uid()}`).send().expect(404, {
                error: "No data found",
            });
        });
    });

    describe("/POST", () => {
        test("Deveria retornar status 400 ao tentrar salvar um usuario sem titulo", async () => {
                await request(server).post("/notes")
                .send({
                    descricao: "any_descricao",
                    loginID: "any_loginID"
                }).expect(400, { error: 'Missing param: titulo' });
        });

        test("Deveria retornar status 400 ao tentrar salvar um usuario sem descricao", async () => {
            await request(server).post("/notes")
            .send({
                titulo: "any_titulo",
                loginID: "any_loginID"
            }).expect(400, { error: 'Missing param: descricao' });
        });

        test("Deveria retornar status 400 ao tentrar salvar um usuario sem loginID", async () => {
            await request(server).post("/notes")
            .send({
                titulo: "any_titulo",
                descricao: "any_descricao",
            }).expect(400, { error: 'Missing param: loginID' });
        });

        test("Deveria retornar 200 quando salvar o usuário", async () => {
            const login = await makeLoginDB();

            await request(server)
              .post("/notes")
              .send({
                titulo: "any_titulo",
                descricao: "any_descricao",
                loginID: login.id
              })
              .expect(200)
              .expect((res) => {
                expect(res.body.id).toBeTruthy();
                expect(res.body.titulo).toBe("any_titulo");
                expect(res.body.descricao).toBe("any_descricao");
                expect(res.body.loginID).toBe(login.id);
              });
          });
    });

    describe("PUT", () => {
        test("Deveria alterar um recado e retorna-lo", async () => {
            const login = await makeLoginDB();
            const note = await makeNoteDB();

            await request(server)
              .put(`/notes/${note.id}`)
              .send({
                titulo: "any_titulo",
                descricao: "any_descricao",
                loginID: login.id
              })
              .expect(200)
              .expect((res) => {
                expect(res.body.titulo).toBe("any_titulo");
                expect(res.body.descricao).toBe("any_descricao");
                expect(res.body.loginID).toBe(login.id);
                });
        });

        test("Deveria retornar status 400 ao tentrar salvar um usuario sem titulo", async () => {
            const login = await makeLoginDB();
            const note = await makeNoteDB();

            await request(server).put(`/notes/${note.id}`)
            .send({
                descricao: "any_descricao",
                loginID: login.id
            }).expect(400, { error: 'Missing param: titulo' });
        });

        test("Deveria retornar status 400 ao tentrar salvar um usuario sem descricao", async () => {
            const login = await makeLoginDB();
                const note = await makeNoteDB();

                await request(server).put(`/notes/${note.id}`)
                .send({
                    titulo: "any_titulo",
                    loginID: login.id
            }).expect(400, { error: 'Missing param: descricao' });
        });

        test("Deveria retornar status 400 ao tentrar salvar um usuario sem loginID", async () => {
            const login = await makeLoginDB();
            const note = await makeNoteDB();

            await request(server).put(`/notes/${note.id}`)
            .send({
                titulo: "any_titulo",
                descricao: login.id
            }).expect(400, { error: 'Missing param: loginID' });
        });
    });

    describe("DELETE", () => {
        test("Deveria excluir um recado", async () => {
            const note = await makeNoteDB();

            await request(server).delete(`/notes/${note.id}`)
            .send().expect(200)
            .expect((res) => {
              expect(res.body.raw).toStrictEqual([]);
            });
        });
    });


});