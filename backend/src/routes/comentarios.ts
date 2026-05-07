import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { enviarEmailComentario } from "../services/emailService";

const router = Router();

const createComentarioSchema = z.object({
  jogoId: z.number().int().positive(),
  texto: z.string().trim().min(1, "Comentario obrigatorio").max(1200),
  usuarioId: z.number().int().positive().optional(),
  adminId: z.number().int().positive().optional(),
  parentId: z.number().int().positive().optional(),
});

router.get("/jogo/:jogoId", async (req, res) => {
  const jogoId = Number(req.params.jogoId);

  if (Number.isNaN(jogoId)) {
    res.status(400).json({ erro: "ID de jogo invalido" });
    return;
  }

  const comentarios = await prisma.comentario.findMany({
    where: { jogoId },
    include: {
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
      admin: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
    },
    orderBy: {
      criadoEm: "asc",
    },
  });

  res.json(comentarios);
});

router.post("/", async (req, res) => {
  const parsed = createComentarioSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ erro: "Dados invalidos", detalhes: parsed.error.flatten() });
    return;
  }

  const { jogoId, texto, usuarioId, adminId, parentId } = parsed.data;

  if ((!usuarioId && !adminId) || (usuarioId && adminId)) {
    res.status(400).json({ erro: "Informe apenas usuarioId ou adminId como autor" });
    return;
  }

  const jogo = await prisma.jogo.findUnique({ where: { id: jogoId } });
  if (!jogo) {
    res.status(404).json({ erro: "Topico nao encontrado" });
    return;
  }

  if (usuarioId) {
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) {
      res.status(404).json({ erro: "Usuario nao encontrado" });
      return;
    }
  }

  if (adminId) {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
      res.status(404).json({ erro: "Admin nao encontrado" });
      return;
    }
  }

  if (parentId) {
    const parent = await prisma.comentario.findUnique({ where: { id: parentId } });
    if (!parent || parent.jogoId !== jogoId) {
      res.status(400).json({ erro: "Comentario pai invalido para este topico" });
      return;
    }
  }

  const comentario = await prisma.comentario.create({
    data: {
      texto,
      jogoId,
      usuarioId: usuarioId ?? null,
      adminId: adminId ?? null,
      parentId: parentId ?? null,
    },
    include: {
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
      admin: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
    },
  });

  // Enviar email apenas para comentários de usuários (não admin)
  if (usuarioId && comentario.usuario) {
    try {
      await enviarEmailComentario({
        usuarioEmail: comentario.usuario.email,
        usuarioNome: comentario.usuario.nome,
        jogoTitulo: jogo.titulo,
        comentarioTexto: comentario.texto,
        data: comentario.criadoEm,
      });
    } catch (emailError) {
      console.error("Erro ao enviar email de comentário:", emailError);
      // Não retorna erro - o comentário foi criado com sucesso mesmo que o email falhe
    }
  }

  res.status(201).json(comentario);
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const adminId = Number(req.body?.adminId);

  if (Number.isNaN(id)) {
    res.status(400).json({ erro: "ID invalido" });
    return;
  }

  if (Number.isNaN(adminId)) {
    res.status(400).json({ erro: "adminId obrigatorio para excluir comentario" });
    return;
  }

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) {
    res.status(403).json({ erro: "Somente admin pode excluir comentarios" });
    return;
  }

  const comentario = await prisma.comentario.findUnique({ where: { id } });
  if (!comentario) {
    res.status(404).json({ erro: "Comentario nao encontrado" });
    return;
  }

  await prisma.comentario.delete({ where: { id } });
  res.json({ mensagem: "Comentario excluido com sucesso" });
});

export default router;
