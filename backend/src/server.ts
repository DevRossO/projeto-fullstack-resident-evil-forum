import express from "express";
import cors from "cors";
import jogosRoutes from "./routes/jogos";
import usuariosRoutes from "./routes/usuarios";
import adminRoutes from "./routes/admin";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("API rodando");
});

app.use("/jogos", jogosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/admin", adminRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ erro: "Erro interno do servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

