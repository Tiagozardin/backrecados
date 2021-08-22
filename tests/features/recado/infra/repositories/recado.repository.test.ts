
import { LoginEntity, RecadoEntity} from '../../../../../src/core/infra';
import Database from '../../../../../src/core/infra/data/connections/database';
import { v4 as uuid } from 'uuid';
import { Recados } from '../../../../../src/features/recado/domain/models';
import RecadoRepository from '../../../../../src/features/recado/infra/repositories/recado.repository';


const makeCreateParams = async (): Promise<Recados> => {
    const login = await makeLoginDB();

    return {
        titulo: "any_titulo",
        descricao: "any_descricao",
        loginID: login.id
    };
};

const makeRecadosDB = async (): Promise<RecadoEntity[]> => {
    const login = await makeLoginDB();

    const recadoA = await RecadoEntity.create({
        titulo: "any_titulo",
        descricao: "any_descricao",
        loginID: login.id
    }).save();

    const recadoB = await RecadoEntity.create({
        titulo: "any_titulo",
        descricao: "any_descricao",
        loginID: login.id
    }).save();

    return [recadoA, recadoB];
};

const makeLoginDB = async (): Promise<LoginEntity> => {
    return await LoginEntity.create({
        email: "any_emailA",
        password: "any_password"
    }).save();
};

const makeRecadoDB = async (): Promise<RecadoEntity> => {
    const login = await makeLoginDB();

    return await RecadoEntity.create({
        titulo: "any_titulo",
        descricao: "any_descricao",
        loginID: login.id
    }).save();
}

const makeUpdateParams = async (): Promise<Recados> => {
    return {
        titulo: "any_titulo",
        descricao: "any_descricao",
    };
};

describe("Recados Repository", () => {
    beforeAll(async () => {
        await new Database().openConnection();
    });

    beforeEach(async () => {
        await LoginEntity.clear();
        await RecadoEntity.clear();
    });

    afterAll(async () => {
        await new Database().disconnectDatabase();
    });

    describe("create", () => {
        test("Deveria retornar um recado quando obtiver sucesso", async () => {
          const sut = new RecadoRepository();
          const params = await makeCreateParams();
          const result = await sut.create(params);
    
          expect(result).toBeTruthy();
          expect(result.id).toBeTruthy();
          expect(result.titulo).toBe("any_titulo");
          expect(result.loginID).toBe(params.loginID);
        });
    });

    describe("Get Recados", () => {
        test("Deveria retornar uma lista de recados", async () => {
            const sut = new RecadoRepository();
            const recados = await makeRecadosDB();
            const result = await sut.getRecados();

            expect(result).toBeTruthy();
            expect(result.length).toBe(recados.length);
        });
    });

    describe("Get recado", () => {
        test("Deveria retornar undefined quando o UID for inexistente", async () => {
            const sut = new RecadoRepository();
            const result = await sut.getRecados();

            expect(result).toBeFalsy();
        });

        test("Deveria retornar um recado quando obtiver um UID válido", async () => {
            const sut = new RecadoRepository();
            const recado = await makeRecadoDB();

            const result = await sut.getRecados();

            expect(result).toBeTruthy();
        });
    });

    describe("Update", () => {
        test("Deveria att um recado para um UID válido", async () => {
          const sut = new RecadoRepository();
          const recado = await makeRecadoDB();
          const params = await makeUpdateParams();
    
          const result = await sut.update(recado.titulo, params);
    
          expect(result).toBeTruthy();
        });
    });

    describe("Delete", () => {
        test("Deveria excluir um usuário caso uid seja válido", async () => {
            const sut = new RecadoRepository();
            const recado = await makeRecadoDB();

            const result = await sut.delete(recado.titulo);

            expect(result).toBeTruthy();
        });
    });
});