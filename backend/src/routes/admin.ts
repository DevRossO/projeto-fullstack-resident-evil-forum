import { Router } from "express";
import { prisma } from "../lib/prisma";
import { createAdminController } from "../controllers/adminController";
import { requireAdminSecret } from "../middlewares/adminSecret";
import {
	AdminInvalidCredentialsError,
	authenticateAdmin,
	changeAdminPassword,
} from "../services/adminService";
import { changeAdminPasswordSchema } from "../validators/adminSchemas";

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

router.post("/create-admin", requireAdminSecret, createAdminController);

router.post("/login", async (req, res) => {
	const { email, senha } = req.body;

	if (!email || !senha) {
		res.status(400).json({ erro: "Email e senha sao obrigatorios" });
		return;
	}

	const admin = await authenticateAdmin(email, senha);

	if (!admin) {
		res.status(401).json({ erro: "Email ou senha invalidos" });
		return;
	}

	res.json(admin);
});

router.patch("/change-password", async (req, res) => {
	const parsed = changeAdminPasswordSchema.safeParse(req.body);

	if (!parsed.success) {
		res.status(400).json({
			erro: "Dados invalidos para troca de senha",
			detalhes: parsed.error.flatten(),
		});
		return;
	}

	const { email, senhaAtual, novaSenha } = parsed.data;

	try {
		await changeAdminPassword(email, senhaAtual, novaSenha);
		res.json({ mensagem: "Senha do admin atualizada com sucesso" });
	} catch (error) {
		if (error instanceof AdminInvalidCredentialsError) {
			res.status(401).json({ erro: error.message });
			return;
		}

		console.error("Erro ao trocar senha do admin:", error);
		res.status(500).json({ erro: "Erro interno ao trocar senha do admin" });
	}
});

export default router;
