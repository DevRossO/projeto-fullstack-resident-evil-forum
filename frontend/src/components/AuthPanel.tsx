import type { FormEventHandler } from "react";
import type { AuthFormState } from "../types";

type AuthPanelProps = {
  mode: "login" | "cadastro";
  form: AuthFormState;
  onChange: (nextForm: AuthFormState) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function AuthPanel({ mode, form, onChange, onSubmit }: AuthPanelProps) {
  const isLogin = mode === "login";

  return (
    <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(92,15,27,0.3),rgba(10,12,16,0.92))] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <span className="inline-flex rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.3em] text-red-100">
          {isLogin ? "Login" : "Cadastro"}
        </span>

        <h1 className="mt-4 max-w-lg text-4xl sm:text-6xl">{isLogin ? "Entre na comunidade" : "Crie sua conta de usuário"}</h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-200/85">
          O fluxo já fica preparado para a próxima etapa de autenticação, sem perder o visual da página principal.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        {!isLogin ? (
          <input
            value={form.nome}
            onChange={(event) => onChange({ ...form, nome: event.target.value })}
            placeholder="Nome"
            className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-zinc-50 placeholder:text-zinc-400 focus:border-red-500 focus:outline-none"
          />
        ) : null}

        <input
          value={form.email}
          onChange={(event) => onChange({ ...form, email: event.target.value })}
          placeholder="Email"
          type="email"
          className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-zinc-50 placeholder:text-zinc-400 focus:border-red-500 focus:outline-none"
        />

        <input
          value={form.senha}
          onChange={(event) => onChange({ ...form, senha: event.target.value })}
          placeholder="Senha"
          type="password"
          className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-zinc-50 placeholder:text-zinc-400 focus:border-red-500 focus:outline-none"
        />

        <button
          type="submit"
          className="mt-2 rounded-2xl border border-red-500/50 bg-red-500/15 px-4 py-3 text-sm font-bold uppercase tracking-[0.24em] text-red-100 transition hover:bg-red-500/25"
        >
          {isLogin ? "Entrar" : "Criar conta"}
        </button>
      </form>
    </section>
  );
}