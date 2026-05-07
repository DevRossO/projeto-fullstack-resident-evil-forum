import { z } from "zod";

export const createAdminSchema = z.object({
  nome: z.string().trim().min(2).max(80).optional(),
  email: z.email(),
  senha: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;

export const changeAdminPasswordSchema = z.object({
  email: z.email(),
  senhaAtual: z.string().min(1, "Informe a senha atual"),
  novaSenha: z.string().min(8, "A nova senha deve ter pelo menos 8 caracteres"),
});

export type ChangeAdminPasswordInput = z.infer<typeof changeAdminPasswordSchema>;
