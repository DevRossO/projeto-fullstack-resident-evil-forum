import { FormEvent, useEffect, useMemo, useState } from "react";
import { criarJogo, listarJogos } from "./api";
import type { CriarJogoPayload, Jogo } from "./types";

type FormState = {
  titulo: string;
  descricao: string;
  ano: string;
  capaUrl: string;
  adminId: string;
};

const initialFormState: FormState = {
  titulo: "",
  descricao: "",
  ano: "",
  capaUrl: "",
  adminId: "",
};

export function App() {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);

  async function carregarJogos() {
    try {
      setLoading(true);
      setError(null);
      const data = await listarJogos();
      setJogos(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar jogos";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void carregarJogos();
  }, []);

  const destaque = useMemo(() => jogos[0], [jogos]);
  const secundarios = useMemo(() => jogos.slice(1, 3), [jogos]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CriarJogoPayload = {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim(),
      ano: Number(form.ano),
      capaUrl: form.capaUrl.trim(),
      adminId: Number(form.adminId),
    };

    if (!payload.titulo || !payload.descricao || !payload.ano || !payload.capaUrl || !payload.adminId) {
      setError("Preencha todos os campos para cadastrar o jogo");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await criarJogo(payload);
      setForm(initialFormState);
      await carregarJogos();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar jogo";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="logo">RESIDENT EVIL FORUM</div>
        <nav className="menu">
          <a href="#destaques">Destaques</a>
          <a href="#cadastro">Cadastrar</a>
          <a href="#jogos">Jogos</a>
        </nav>
      </header>

      <main className="layout">
        <section id="destaques" className="hero-grid">
          <article className="hero-card big">
            {destaque ? (
              <>
                <img src={destaque.capaUrl} alt={destaque.titulo} />
                <div className="overlay" />
                <div className="content">
                  <span className="tag">DESTAQUE</span>
                  <h1>{destaque.titulo}</h1>
                  <p>{destaque.descricao}</p>
                </div>
              </>
            ) : (
              <div className="empty">Cadastre seu primeiro jogo para aparecer aqui.</div>
            )}
          </article>

          <aside className="side-column">
            {secundarios.map((jogo) => (
              <article key={jogo.id} className="hero-card small">
                <img src={jogo.capaUrl} alt={jogo.titulo} />
                <div className="overlay" />
                <div className="content">
                  <span className="tag">ANALISE</span>
                  <h2>{jogo.titulo}</h2>
                </div>
              </article>
            ))}
            {secundarios.length === 0 && <div className="empty side">Sem cards secundarios ainda.</div>}
          </aside>
        </section>

        <section id="cadastro" className="panel">
          <h3>Novo Jogo</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <input
              value={form.titulo}
              onChange={(e) => setForm((old) => ({ ...old, titulo: e.target.value }))}
              placeholder="Titulo"
            />
            <input
              value={form.ano}
              onChange={(e) => setForm((old) => ({ ...old, ano: e.target.value }))}
              placeholder="Ano"
              type="number"
            />
            <input
              value={form.adminId}
              onChange={(e) => setForm((old) => ({ ...old, adminId: e.target.value }))}
              placeholder="Admin ID"
              type="number"
            />
            <input
              value={form.capaUrl}
              onChange={(e) => setForm((old) => ({ ...old, capaUrl: e.target.value }))}
              placeholder="URL da capa"
              className="full"
            />
            <textarea
              value={form.descricao}
              onChange={(e) => setForm((old) => ({ ...old, descricao: e.target.value }))}
              placeholder="Descricao"
              className="full"
              rows={4}
            />
            <button disabled={saving} type="submit" className="full">
              {saving ? "Salvando..." : "Publicar Jogo"}
            </button>
          </form>
          {error && <p className="feedback error">{error}</p>}
        </section>

        <section id="jogos" className="panel list">
          <div className="heading-row">
            <h3>Todos os Jogos</h3>
            <button onClick={() => void carregarJogos()} disabled={loading}>
              {loading ? "Atualizando..." : "Atualizar"}
            </button>
          </div>

          {loading && <p className="feedback">Carregando jogos...</p>}

          {!loading && jogos.length === 0 && <p className="feedback">Nenhum jogo cadastrado.</p>}

          <div className="cards">
            {jogos.map((jogo) => (
              <article key={jogo.id} className="game-card">
                <img src={jogo.capaUrl} alt={jogo.titulo} />
                <div>
                  <h4>{jogo.titulo}</h4>
                  <p>{jogo.descricao}</p>
                  <small>
                    {jogo.ano} • Admin: {jogo.admin?.nome ?? jogo.adminId} • Avaliacoes: {jogo.avaliacoes?.length ?? 0}
                  </small>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
