export type Admin = {
  id: number;
  nome: string;
  email: string;
};

export type Usuario = {
  id: number;
  nome: string;
  email: string;
};

export type Avaliacao = {
  id: number;
  nota: number;
  comentario: string;
  usuarioId: number;
  jogoId: number;
  usuario?: Usuario;
};

export type Jogo = {
  id: number;
  titulo: string;
  descricao: string;
  ano: number;
  capaUrl: string;
  adminId: number;
  admin?: Admin;
  avaliacoes?: Avaliacao[];
};

export type CriarJogoPayload = {
  titulo: string;
  descricao: string;
  ano: number;
  capaUrl: string;
  adminId: number;
};
