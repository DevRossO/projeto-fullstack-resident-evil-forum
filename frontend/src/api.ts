import type { CriarJogoPayload, Jogo } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function listarJogos(): Promise<Jogo[]> {
  const response = await fetch(`${API_BASE_URL}/jogos`);

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar os jogos");
  }

  return response.json() as Promise<Jogo[]>;
}

export async function criarJogo(payload: CriarJogoPayload): Promise<Jogo> {
  const response = await fetch(`${API_BASE_URL}/jogos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = (errorBody as { erro?: string }).erro ?? "Erro ao criar jogo";
    throw new Error(message);
  }

  return response.json() as Promise<Jogo>;
}
