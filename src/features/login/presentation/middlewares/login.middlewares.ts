import {
    badRequest,
    HttpMiddleware,
    HttpResponse,
    ok,
  } from "../../../../core/presentation";
import { RequireFieldsValidator } from "../../../../core/presentation/validators";
  
  export class LoginMiddleware {
    async handle(req: HttpMiddleware): Promise<HttpResponse> {
      const { body } = req;
  
      for (const field of ["email", "password"]) {
        const error = new RequireFieldsValidator(field).validate(body);
        if (error) {
          return badRequest(error);
        }
      }
  
      return ok({});
    }
  }
  