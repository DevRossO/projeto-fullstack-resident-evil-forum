import { useState, useEffect } from "react";
import { AuthResponse } from "../types";

function normalizeRole(user: AuthResponse): AuthResponse {
  return {
    ...user,
    role: user.role === "admin" ? "admin" : "usuario",
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Recuperar usuário do localStorage ao carregar
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      try {
        const userData = localStorage.getItem("userData");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(normalizeRole(parsedUser as AuthResponse));
        }
      } catch (error) {
        console.error("Erro ao recuperar usuário do localStorage:", error);
        localStorage.removeItem("userId");
        localStorage.removeItem("userData");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    const endpoints = [
      { url: "http://localhost:3000/admin/login", role: "admin" as const },
      { url: "http://localhost:3000/usuarios/login", role: "usuario" as const },
    ];

    try {
      for (const endpoint of endpoints) {
        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, senha }),
        });

        if (response.ok) {
          const responseData: AuthResponse = await response.json();
          const userData = normalizeRole({
            ...responseData,
            role: responseData.role ?? endpoint.role,
          });

          localStorage.setItem("userId", userData.id.toString());
          localStorage.setItem("userData", JSON.stringify(userData));
          setUser(userData);

          return userData;
        }

        if (response.status !== 401) {
          const error = await response.json().catch(() => ({}));
          throw new Error((error as { erro?: string }).erro || "Erro ao fazer login");
        }
      }

      throw new Error("Email ou senha invalidos");
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  };

  const signup = async (nome: string, email: string, senha: string) => {
    try {
      const response = await fetch("http://localhost:3000/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, email, senha }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.erro || "Erro ao cadastrar");
      }

      const userData: AuthResponse = await response.json();
      
      // Apenas retorna os dados, não faz login automático
      return userData;
    } catch (error) {
      console.error("Erro no cadastro:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    setUser(null);
  };

  return {
    user,
    isLoading,
    login,
    signup,
    logout,
  };
};
