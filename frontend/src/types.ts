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

export type AuthRole = "usuario" | "admin";

export type AuthResponse = {
  id: number;
  nome: string;
  email: string;
  role?: AuthRole;
};

export type AuthFormState = {
  nome?: string;
  email: string;
  senha: string;
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
  lore?: string | null;
  destaque: boolean;
  ano: number;
  capaUrl: string;
  adminId: number;
  admin?: Admin;
  avaliacoes?: Avaliacao[];
  comentarios?: Array<{ id: number }>;
};

export type CriarJogoPayload = {
  titulo: string;
  descricao: string;
  lore?: string;
  destaque?: boolean;
  ano: number;
  capaUrl: string;
  adminId: number;
};

export type GameHighlight = {
  id: string;
  title: string;
  image: string;
  badge: string;
  theme: string;
  keywords: string[];
  summary: string;
  lore: string;
  featured?: boolean;
  dbId?: number;
  commentCount?: number;
};

export type TopicComment = {
  id: number;
  jogoId: number;
  parentId?: number | null;
  userName: string;
  userRole: "admin" | "usuario";
  text: string;
  createdAt: string;
  replies: TopicComment[];
};

export type CriarComentarioPayload = {
  jogoId: number;
  texto: string;
  usuarioId?: number;
  adminId?: number;
  parentId?: number;
};

export type ThemeFilter = "Todos" | "Clássico" | "Terror" | "Ação" | "Sobrevivência" | "Suspense";
