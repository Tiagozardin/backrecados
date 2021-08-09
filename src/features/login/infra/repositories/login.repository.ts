
import { error } from "console";
import { LoginEntity } from "../../../../core/infra";
import { serverError } from "../../../../core/presentation";
import { Login} from "../../domain/models";

export default class LoginRepository {
    async getLogins(): Promise<Login[]> {
        const logins = await LoginEntity.find();
    
        return logins.map((login) => {
          return {
            id: login.id,
            email: login.email,
            password: login.password
          } as Login;
        });
      }

      async getLogin(email: string, password: string): Promise<Login | undefined> {
        const login = await LoginEntity.findOne({
          where: { email: email, password: password },
        });
    
        if (!login) return undefined;
    
        return {
          id: login.id
        } as Login;

      }
      async create(params: Login):Promise<Login> {
        const{ email, password} = params;

        const login = await LoginEntity.create({
          email,
          password
        }).save();
        return Object.assign({}, params, login);
      }

      async update(id: number, params: Login) {
        const {email, password} = params;

        const result = await LoginEntity.update(id, {
          email,
          password
        });
        return Object.assign({}, params, result);
      }

      async delete(id: number) {
         return await LoginEntity.delete(id);
        
      }
    }
