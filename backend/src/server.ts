import "dotenv/config";
import express from "express";
import cors from "cors";
import jogosRoutes from "./routes/jogos";
import usuariosRoutes from "./routes/usuarios";
import adminRoutes from "./routes/admin";
import comentariosRoutes from "./routes/comentarios";
import { requireAdminSecret } from "./middlewares/adminSecret";
import { createAdminController } from "./controllers/adminController";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("API rodando");
});

// Alias para facilitar chamada direta no Thunder Client
app.post("/create-admin", requireAdminSecret, createAdminController);

app.use("/jogos", jogosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/admin", adminRoutes);
app.use("/comentarios", comentariosRoutes);

app.use((_req, res) => {
  res.status(404).json({ erro: "Rota nao encontrada" });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ erro: "Erro interno do servidor" });
});

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\nSIGTERM recebido. Encerrando o servidor...");
  server.close(() => {
    console.log("Servidor encerrado com sucesso.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\nSIGINT recebido. Encerrando o servidor...");
  server.close(() => {
    console.log("Servidor encerrado com sucesso.");
    process.exit(0);
  });
});

