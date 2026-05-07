import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import type { CreateAdminInput } from "../validators/adminSchemas";

const SALT_ROUNDS = 12;

function isBcryptHash(value: string) {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

export class AdminRootAlreadyExistsError extends Error {
  constructor() {
    super("Ja existe um admin root cadastrado");
    this.name = "AdminRootAlreadyExistsError";
  }
}

export class AdminEmailAlreadyExistsError extends Error {
  constructor() {
    super("Email de admin ja cadastrado");
    this.name = "AdminEmailAlreadyExistsError";
  }
}

export class AdminInvalidCredentialsError extends Error {
  constructor() {
    super("Email ou senha invalidos");
    this.name = "AdminInvalidCredentialsError";
  }
}

export async function createRootAdmin(data: CreateAdminInput) {
  const hasAnyAdmin = await prisma.admin.count();
  if (hasAnyAdmin > 0) {
    throw new AdminRootAlreadyExistsError();
  }

  const normalizedEmail = data.email.trim().toLowerCase();
  const existingByEmail = await prisma.admin.findUnique({ where: { email: normalizedEmail } });
  if (existingByEmail) {
    throw new AdminEmailAlreadyExistsError();
  }

  const hashedPassword = await bcrypt.hash(data.senha, SALT_ROUNDS);

  const admin = await prisma.admin.create({
    data: {
      nome: data.nome?.trim() || "Admin Root",
      email: normalizedEmail,
      senha: hashedPassword,
    },
    select: {
      id: true,
      nome: true,
      email: true,
    },
  });

  return {
    ...admin,
    role: "admin" as const,
  };
}

export async function authenticateAdmin(email: string, senha: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const admin = await prisma.admin.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      nome: true,
      email: true,
      senha: true,
    },
  });

  if (!admin) {
    return null;
  }

  let isPasswordValid = false;

  if (isBcryptHash(admin.senha)) {
    isPasswordValid = await bcrypt.compare(senha, admin.senha);
  } else {
    // Compatibilidade temporaria para admins antigos com senha salva em texto puro.
    isPasswordValid = admin.senha === senha;

    if (isPasswordValid) {
      const upgradedHash = await bcrypt.hash(senha, SALT_ROUNDS);
      await prisma.admin.update({
        where: { id: admin.id },
        data: { senha: upgradedHash },
      });
    }
  }

  if (!isPasswordValid) {
    return null;
  }

  return {
    id: admin.id,
    nome: admin.nome,
    email: admin.email,
    role: "admin" as const,
  };
}

export async function changeAdminPassword(email: string, senhaAtual: string, novaSenha: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const admin = await prisma.admin.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      senha: true,
    },
  });

  if (!admin) {
    throw new AdminInvalidCredentialsError();
  }

  let isCurrentPasswordValid = false;

  if (isBcryptHash(admin.senha)) {
    isCurrentPasswordValid = await bcrypt.compare(senhaAtual, admin.senha);
  } else {
    isCurrentPasswordValid = admin.senha === senhaAtual;
  }

  if (!isCurrentPasswordValid) {
    throw new AdminInvalidCredentialsError();
  }

  const updatedHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);

  await prisma.admin.update({
    where: { id: admin.id },
    data: { senha: updatedHash },
  });
}
