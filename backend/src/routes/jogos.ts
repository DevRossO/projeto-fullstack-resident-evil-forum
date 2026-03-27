import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  const jogos = await prisma.jogo.findMany({
    include: {
      admin: true,
      avaliacoes: true,
    },
  });

  res.json(jogos);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ erro: "ID invalido" });
    return;
  }

  const jogo = await prisma.jogo.findUnique({
    where: { id },
    include: {
      admin: true,
      avaliacoes: {
        include: {
          usuario: true,
        },
      },
    },
  });

  if (!jogo) {
    res.status(404).json({ erro: "Jogo nao encontrado" });
    return;
  }

  res.json(jogo);
});

router.post("/", async (req, res) => {
  const { titulo, descricao, ano, capaUrl, adminId } = req.body;

  if (!titulo || !descricao || !ano || !capaUrl || !adminId) {
    res.status(400).json({ erro: "Campos obrigatorios ausentes" });
    return;
  }

  const jogo = await prisma.jogo.create({
    data: {
      titulo,
      descricao,
      ano,
      capaUrl,
      adminId,
    },
  });

  res.status(201).json(jogo);
});

export default router;