import express from "express";
import {RecadoEntity} from "../../../../core/infra/data/database/entities/recado.entity";

async function validateId(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {

  const { id } = req.params;

    const exist = await RecadoEntity.findOne(id);
    if (!exist) {
      return res.status(404).json({
        msg: "Item não encontrado",
      });
    }

  next();
}

export { validateId };

  