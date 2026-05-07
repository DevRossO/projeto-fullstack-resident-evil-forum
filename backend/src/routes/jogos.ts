import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  const jogos = await prisma.jogo.findMany({
    include: {
      admin: true,
      avaliacoes: true,
      comentarios: true,
    },
    orderBy: {
      id: "asc",
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
      comentarios: {
        include: {
          usuario: true,
          admin: true,
        },
        orderBy: {
          criadoEm: "asc",
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
  const { titulo, descricao, lore, destaque, ano, capaUrl, adminId } = req.body;

  if (!titulo || !descricao || !ano || !capaUrl || !adminId) {
    res.status(400).json({ erro: "Campos obrigatorios ausentes" });
    return;
  }

  const admin = await prisma.admin.findUnique({ where: { id: Number(adminId) } });
  if (!admin) {
    res.status(404).json({ erro: "Admin nao encontrado" });
    return;
  }

  // Se marcar como destaque, remover destaque de todos os outros
  if (Boolean(destaque)) {
    await prisma.jogo.updateMany({
      where: { destaque: true },
      data: { destaque: false },
    });
  }

  const jogo = await prisma.jogo.create({
    data: {
      titulo,
      descricao,
      lore: lore?.trim() || null,
      destaque: Boolean(destaque),
      ano,
      capaUrl,
      adminId,
    },
  });

  res.status(201).json(jogo);
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const adminId = Number(req.body?.adminId);

  if (Number.isNaN(id)) {
    res.status(400).json({ erro: "ID invalido" });
    return;
  }

  if (Number.isNaN(adminId)) {
    res.status(400).json({ erro: "adminId obrigatorio para excluir topico" });
    return;
  }

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) {
    res.status(403).json({ erro: "Somente admin pode excluir topicos" });
    return;
  }

  const jogo = await prisma.jogo.findUnique({ where: { id } });
  if (!jogo) {
    res.status(404).json({ erro: "Jogo nao encontrado" });
    return;
  }

  await prisma.jogo.delete({ where: { id } });
  res.json({ mensagem: "Topico excluido com sucesso" });
});

export default router;