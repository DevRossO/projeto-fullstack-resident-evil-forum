import type { Request, Response } from "express";
import { createAdminSchema } from "../validators/adminSchemas";
import {
  AdminEmailAlreadyExistsError,
  AdminRootAlreadyExistsError,
  createRootAdmin,
} from "../services/adminService";

export async function createAdminController(req: Request, res: Response) {
  const parsed = createAdminSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      erro: "Dados invalidos para criacao de admin",
      detalhes: parsed.error.flatten(),
    });
    return;
  }

  try {
    const admin = await createRootAdmin(parsed.data);

    res.status(201).json({
      mensagem: "Admin root criado com sucesso",
      admin,
    });
  } catch (error) {
    if (error instanceof AdminRootAlreadyExistsError) {
      res.status(409).json({ erro: error.message });
      return;
    }

    if (error instanceof AdminEmailAlreadyExistsError) {
      res.status(409).json({ erro: error.message });
      return;
    }

    console.error("Erro ao criar admin root:", error);
    res.status(500).json({ erro: "Erro interno ao criar admin root" });
  }
}
