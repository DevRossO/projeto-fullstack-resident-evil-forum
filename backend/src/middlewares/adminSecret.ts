import type { NextFunction, Request, Response } from "express";

export function requireAdminSecret(req: Request, res: Response, next: NextFunction) {
  const expectedSecret = process.env.ADMIN_SECRET;
  const providedSecret = req.header("x-admin-secret");

  if (!expectedSecret) {
    res.status(500).json({
      erro: "ADMIN_SECRET nao configurado no ambiente",
      detalhe: "Defina ADMIN_SECRET no arquivo .env e reinicie o servidor",
    });
    return;
  }

  if (!providedSecret || providedSecret !== expectedSecret) {
    res.status(403).json({
      erro: "Forbidden: segredo invalido",
      detalhe: "Envie o header x-admin-secret com o valor correto de ADMIN_SECRET",
    });
    return;
  }

  next();
}
