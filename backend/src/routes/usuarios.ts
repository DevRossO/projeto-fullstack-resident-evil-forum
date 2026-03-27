import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
	const usuarios = await prisma.usuario.findMany({
		select: {
			id: true,
			nome: true,
			email: true,
		},
	});

	res.json(usuarios);
});

router.post("/", async (req, res) => {
	const { nome, email, senha } = req.body;

	if (!nome || !email || !senha) {
		res.status(400).json({ erro: "Campos obrigatorios ausentes" });
		return;
	}

	const usuarioExistente = await prisma.usuario.findUnique({
		where: { email },
	});

	if (usuarioExistente) {
		res.status(409).json({ erro: "Email ja cadastrado" });
		return;
	}

	const usuario = await prisma.usuario.create({
		data: {
			nome,
			email,
			senha,
		},
		select: {
			id: true,
			nome: true,
			email: true,
		},
	});

	res.status(201).json(usuario);
});

export default router;
