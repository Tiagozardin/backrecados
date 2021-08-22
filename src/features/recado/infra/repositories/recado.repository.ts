import { RecadoEntity } from "../../../../core/infra";
import { Recados } from "../../domain/models";



export default class RecadoRepository {
    async getRecados(): Promise<Recados[]> {
        const recados = await RecadoEntity.find();
    
        return recados.map((recado) => {
          return {
            id: recado.id,
            titulo: recado.titulo,
            descricao: recado.descricao,
            loginID: recado.loginID
          } as Recados;
        });
      }

      async getRecado(id: string): Promise<Recados | undefined> {
        const recado = await RecadoEntity.findOne({
          where: { id: id},
        });
    
        if (!recado) {
          return undefined;
        }
    
        return {
          id: recado.id,
          titulo: recado.titulo,
          descricao: recado.descricao,
          loginID: recado.loginID
        };
      }
      
      async create(params: Recados):Promise<Recados> {
        const{titulo, descricao, loginID} = params;

        const recado = await RecadoEntity.create({
          titulo,
          descricao,
          loginID         
        }).save();

        return Object.assign({}, params, recado);
      }

      async update(id: string, params: Recados): Promise<Recados | undefined> {
        const {titulo, descricao} = params;

        const result = await RecadoEntity.update(id, {
          titulo, 
          descricao
        });
        return Object.assign({}, params, result);
      }

      async delete(id: string) {
         return await RecadoEntity.delete(id);
        
      }
    }
