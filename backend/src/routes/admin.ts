import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
	const admins = await prisma.admin.findMany({
		select: {
			id: true,
			nome: true,
			email: true,
		},
	});

	res.json(admins);
});

router.post("/", async (req, res) => {
	const { nome, email, senha } = req.body;

	if (!nome || !email || !senha) {
		res.status(400).json({ erro: "Campos obrigatorios ausentes" });
		return;
	}

	const adminExistente = await prisma.admin.findUnique({
		where: { email },
	});

	if (adminExistente) {
		res.status(409).json({ erro: "Email ja cadastrado" });
		return;
	}

	const admin = await prisma.admin.create({
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

	res.status(201).json(admin);
});

export default router;
