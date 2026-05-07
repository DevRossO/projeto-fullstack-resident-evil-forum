import type { CriarComentarioPayload, CriarJogoPayload, Jogo, Usuario } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function listarJogos(): Promise<Jogo[]> {
  const response = await fetch(`${API_BASE_URL}/jogos`);

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar os jogos");
  }

  return response.json() as Promise<Jogo[]>;
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const response = await fetch(`${API_BASE_URL}/usuarios`);

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar os usuarios");
  }

  return response.json() as Promise<Usuario[]>;
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

export async function excluirJogo(id: number, adminId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/jogos/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ adminId }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = (errorBody as { erro?: string }).erro ?? "Erro ao excluir topico";
    throw new Error(message);
  }
}

export type RawComentario = {
  id: number;
  texto: string;
  criadoEm: string;
  jogoId: number;
  parentId?: number | null;
  usuario?: { id: number; nome: string } | null;
  admin?: { id: number; nome: string } | null;
};

export async function listarComentarios(jogoId: number) {
  const response = await fetch(`${API_BASE_URL}/comentarios/jogo/${jogoId}`);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = (errorBody as { erro?: string }).erro ?? "Erro ao carregar comentarios";
    throw new Error(message);
  }

  return response.json() as Promise<RawComentario[]>;
}

export async function criarComentario(payload: CriarComentarioPayload) {
  const response = await fetch(`${API_BASE_URL}/comentarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = (errorBody as { erro?: string }).erro ?? "Erro ao criar comentario";
    throw new Error(message);
  }

  return response.json() as Promise<RawComentario>;
}

export async function excluirComentario(id: number, adminId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/comentarios/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ adminId }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = (errorBody as { erro?: string }).erro ?? "Erro ao excluir comentario";
    throw new Error(message);
  }
}
