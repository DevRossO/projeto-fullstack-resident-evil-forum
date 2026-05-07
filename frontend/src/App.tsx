import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  criarComentario,
  criarJogo,
  excluirComentario,
  excluirJogo,
  listarComentarios,
  listarJogos,
} from "./api";
import type { RawComentario } from "./api";
import { AdminDashboard } from "./components/AdminDashboard";
import { AuthPanel } from "./components/AuthPanel";
import { GameGallery } from "./components/GameGallery";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { TopicDetail } from "./components/TopicDetail";
import { showcaseGames } from "./data/showcaseGames";
import { filterGames } from "./utils/searchGames";
import { useAuth } from "./hooks/useAuth";
import type { AuthFormState, GameHighlight, Jogo, TopicComment } from "./types";

export type Screen = "home" | "login" | "cadastro" | "topico";

const initialAuthState: AuthFormState = {
  nome: "",
  email: "",
  senha: "",
};

type TopicFormState = {
  titulo: string;
  descricao: string;
  lore: string;
  destaque: boolean;
  ano: string;
  capaUrl: string;
  tema: string;
};

const initialTopicFormState: TopicFormState = {
  titulo: "",
  descricao: "",
  lore: "",
  destaque: false,
  ano: "",
  capaUrl: "",
  tema: "Sobrevivência",
};

const navigationItems = [
  { label: "Home", target: "home" as Screen },
  { label: "Cadastro", target: "cadastro" as Screen },
  { label: "Login", target: "login" as Screen },
];

const localCommentsStorageKey = "localTopicComments";
const localTopicClicksStorageKey = "localTopicClicks";

export function App() {
  const { user, isLoading, login, signup, logout } = useAuth();
  const [screen, setScreen] = useState<Screen>("home");
  const [notice, setNotice] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginForm, setLoginForm] = useState<AuthFormState>(initialAuthState);
  const [cadastroForm, setCadastroForm] = useState<AuthFormState>(initialAuthState);
  const [searchValue, setSearchValue] = useState("");
  const [games, setGames] = useState<GameHighlight[]>(showcaseGames);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [topicForm, setTopicForm] = useState<TopicFormState>(initialTopicFormState);
  const [selectedTopic, setSelectedTopic] = useState<GameHighlight | null>(null);
  const [topicComments, setTopicComments] = useState<TopicComment[]>([]);
  const [localTopicComments, setLocalTopicComments] = useState<Record<string, TopicComment[]>>({});
  const [localTopicClicks, setLocalTopicClicks] = useState<Record<string, number>>({});

  const isAdmin = user?.role === "admin";

  const filteredGames = filterGames(games, searchValue);

  const topicMetrics = useMemo(() => {
    return games.map((game) => {
      const localCount = countCommentsTree(localTopicComments[game.id] ?? []);
      const apiCount = game.commentCount ?? 0;
      return {
        id: game.id,
        title: game.title,
        totalComments: apiCount + localCount,
        clicks: localTopicClicks[game.id] ?? 0,
      };
    });
  }, [games, localTopicComments, localTopicClicks]);

  const commentMetrics = useMemo(
    () =>
      [...topicMetrics]
        .sort((a, b) => b.totalComments - a.totalComments)
        .map((topic) => ({ id: topic.id, title: topic.title, value: topic.totalComments })),
    [topicMetrics],
  );

  const clickMetrics = useMemo(
    () =>
      [...topicMetrics]
        .sort((a, b) => b.clicks - a.clicks)
        .map((topic) => ({ id: topic.id, title: topic.title, value: topic.clicks })),
    [topicMetrics],
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(localCommentsStorageKey);
      if (stored) {
        setLocalTopicComments(JSON.parse(stored) as Record<string, TopicComment[]>);
      }
    } catch {
      setLocalTopicComments({});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(localCommentsStorageKey, JSON.stringify(localTopicComments));
  }, [localTopicComments]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(localTopicClicksStorageKey);
      if (stored) {
        setLocalTopicClicks(JSON.parse(stored) as Record<string, number>);
      }
    } catch {
      setLocalTopicClicks({});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(localTopicClicksStorageKey, JSON.stringify(localTopicClicks));
  }, [localTopicClicks]);

  useEffect(() => {
    async function loadTopics() {
      setIsLoadingTopics(true);
      try {
        const apiTopics = await listarJogos();
        const mappedTopics = apiTopics.map((topic) => mapApiGameToHighlight(topic));

        const mergedGames = [...showcaseGames, ...mappedTopics];
        const deduplicatedGames = Array.from(new Map(mergedGames.map((game) => [game.id, game])).values());

        setGames(deduplicatedGames);
      } catch {
        setNotice((currentNotice) => currentNotice ?? "Nao foi possivel sincronizar os topicos no momento.");
      } finally {
        setIsLoadingTopics(false);
      }
    }

    void loadTopics();
  }, []);

  function openScreen(nextScreen: Screen) {
    setNotice(null);
    setScreen(nextScreen);
    setMobileMenuOpen(false);

    if (nextScreen === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!loginForm.email.trim() || !loginForm.senha.trim()) {
      setNotice("Preencha email e senha para continuar.");
      return;
    }

    try {
      await login(loginForm.email, loginForm.senha);
      setNotice("Login realizado com sucesso!");
      setLoginForm(initialAuthState);
      setScreen("home");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Erro ao fazer login");
    }
  }

  async function handleCadastroSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!cadastroForm.nome?.trim() || !cadastroForm.email.trim() || !cadastroForm.senha.trim()) {
      setNotice("Preencha nome, email e senha para criar sua conta de usuário.");
      return;
    }

    try {
      await signup(cadastroForm.nome, cadastroForm.email, cadastroForm.senha);
      window.alert("Cadastro realizado com sucesso! Agora faça login para acessar sua conta.");
      setNotice("Cadastro realizado com sucesso.");
      setCadastroForm(initialAuthState);
      setScreen("home");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Erro ao cadastrar");
    }
  }

  function handleLogout() {
    logout();
    setScreen("home");
    setNotice("Desconectado com sucesso!");
  }

  function handleOpenTopic(game: GameHighlight) {
    if (!user) {
      setNotice("Para acessar e comentar nos tópicos, faça login ou crie seu cadastro.");
      setScreen("login");
      return;
    }

    setNotice(null);
    if (!isAdmin) {
      setLocalTopicClicks((current) => ({
        ...current,
        [game.id]: (current[game.id] ?? 0) + 1,
      }));
    }
    setSelectedTopic(game);
    setScreen("topico");
    void loadCommentsForTopic(game);
  }

  function handleBackToHome() {
    setScreen("home");
    setSelectedTopic(null);
    setTopicComments([]);
  }

  async function handleAddTopicComment(text: string, parentId?: number) {
    if (!user || !selectedTopic) {
      return;
    }

    if (!selectedTopic.dbId) {
      const nextComment: TopicComment = {
        id: Date.now(),
        jogoId: -1,
        parentId: parentId ?? null,
        userName: user.nome,
        userRole: isAdmin ? "admin" : "usuario",
        text,
        createdAt: new Date().toISOString(),
        replies: [],
      };

      const topicId = selectedTopic.id;
      const currentTree = localTopicComments[topicId] ?? [];
      const updatedTree = parentId
        ? addReplyToTree(currentTree, parentId, nextComment)
        : [...currentTree, nextComment];

      setLocalTopicComments((current) => ({ ...current, [topicId]: updatedTree }));
      setTopicComments(updatedTree);
      setNotice(parentId ? "Resposta enviada com sucesso." : "Comentario enviado com sucesso.");
      return;
    }

    try {
      await criarComentario({
        jogoId: selectedTopic.dbId,
        texto: text,
        parentId,
        ...(isAdmin ? { adminId: user.id } : { usuarioId: user.id }),
      });

      setGames((currentGames) =>
        currentGames.map((game) =>
          game.id === selectedTopic.id ? { ...game, commentCount: (game.commentCount ?? 0) + 1 } : game,
        ),
      );

      await loadCommentsForTopic(selectedTopic);
      setNotice(parentId ? "Resposta enviada com sucesso." : "Comentario enviado com sucesso.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Erro ao comentar no topico");
    }
  }

  async function handleDeleteTopic(game: GameHighlight) {
    if (!isAdmin || !user) {
      return;
    }

    if (!game.dbId) {
      setNotice("Topicos fixos da vitrine nao podem ser excluidos.");
      return;
    }

    try {
      await excluirJogo(game.dbId, user.id);
      setGames((currentGames) => currentGames.filter((item) => item.id !== game.id));

      if (selectedTopic?.id === game.id) {
        handleBackToHome();
      }

      setNotice("Topico excluido com sucesso.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Erro ao excluir topico");
    }
  }

  async function handleDeleteComment(commentId: number) {
    if (!isAdmin || !user || !selectedTopic) {
      return;
    }

    if (!selectedTopic.dbId) {
      const topicId = selectedTopic.id;
      const currentTree = localTopicComments[topicId] ?? [];
      const updatedTree = removeCommentFromTree(currentTree, commentId);

      setLocalTopicComments((current) => ({ ...current, [topicId]: updatedTree }));
      setTopicComments(updatedTree);
      setNotice("Comentario excluido com sucesso.");
      return;
    }

    try {
      await excluirComentario(commentId, user.id);

      setGames((currentGames) =>
        currentGames.map((game) =>
          game.id === selectedTopic.id
            ? { ...game, commentCount: Math.max((game.commentCount ?? 0) - 1, 0) }
            : game,
        ),
      );

      await loadCommentsForTopic(selectedTopic);
      setNotice("Comentario excluido com sucesso.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Erro ao excluir comentario");
    }
  }

  async function loadCommentsForTopic(game: GameHighlight) {
    if (!game.dbId) {
      setTopicComments(localTopicComments[game.id] ?? []);
      return;
    }

    setIsLoadingComments(true);
    try {
      const rawComments = await listarComentarios(game.dbId);
      setTopicComments(buildCommentsTree(rawComments));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Erro ao carregar comentarios");
    } finally {
      setIsLoadingComments(false);
    }
  }

  async function handleCreateTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAdmin || !user) {
      setNotice("Apenas admins podem criar topicos.");
      return;
    }

    if (!topicForm.titulo.trim() || !topicForm.descricao.trim() || !topicForm.ano.trim() || !topicForm.capaUrl.trim()) {
      setNotice("Preencha titulo, descricao, ano e URL da capa para criar o topico.");
      return;
    }

    const parsedYear = Number(topicForm.ano);
    if (Number.isNaN(parsedYear)) {
      setNotice("Informe um ano valido para o topico.");
      return;
    }

    try {
      const createdTopic = await criarJogo({
        titulo: topicForm.titulo.trim(),
        descricao: topicForm.descricao.trim(),
        lore: topicForm.lore.trim(),
        destaque: topicForm.destaque,
        ano: parsedYear,
        capaUrl: topicForm.capaUrl.trim(),
        adminId: user.id,
      });

      const highlightedTopic = mapApiGameToHighlight(createdTopic, topicForm.tema);
      setGames((currentGames) => [...currentGames, highlightedTopic]);
      setTopicForm(initialTopicFormState);
      setNotice("Topico criado e adicionado ao mural com sucesso!");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Erro ao criar topico");
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_10%_-10%,rgba(122,15,24,0.4),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(18,24,36,0.35),transparent_30%),#050608] text-zinc-50 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_-10%,rgba(122,15,24,0.4),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(18,24,36,0.35),transparent_30%),#050608] text-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-3 py-3 md:px-6">
        <SiteHeader
          user={user}
          onLogout={handleLogout}
          activeScreen={screen}
          navigationItems={navigationItems}
          mobileMenuOpen={mobileMenuOpen}
          searchValue={searchValue}
          onLogoClick={() => openScreen("home")}
          onNavigate={openScreen}
          onMobileMenuToggle={() => setMobileMenuOpen((current) => !current)}
          onSearchChange={setSearchValue}
        />

        <main className="flex flex-1 flex-col gap-4">
          {screen === "home" ? (
            <>
              {isAdmin ? (
                <AdminDashboard
                  clickMetrics={clickMetrics}
                  commentMetrics={commentMetrics}
                  isLoading={isLoadingTopics}
                />
              ) : null}

              {isLoadingTopics ? (
                <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center text-zinc-200 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
                  Carregando topicos...
                </section>
              ) : (
                <GameGallery
                  games={filteredGames}
                  mode={isAdmin ? "admin" : "usuario"}
                  onOpenTopic={handleOpenTopic}
                  onDeleteTopic={isAdmin ? handleDeleteTopic : undefined}
                />
              )}

              {isAdmin ? (
                <section className="rounded-[2rem] border border-red-500/30 bg-[linear-gradient(160deg,rgba(92,15,27,0.35),rgba(10,12,16,0.94))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-7">
                  <div className="mb-4">
                    <span className="inline-flex rounded-full border border-red-300/30 bg-red-500/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.3em] text-red-100">
                      Painel Admin
                    </span>
                    <h2 className="mt-3 text-3xl text-red-100">Criar novo topico/card</h2>
                    <p className="mt-2 text-sm text-zinc-200/85 sm:text-base">
                      Os cards aparecem em grade de 3 colunas. Ao criar, o novo topico entra no mural imediatamente.
                    </p>
                  </div>

                  <form onSubmit={handleCreateTopic} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <input
                      value={topicForm.titulo}
                      onChange={(event) => setTopicForm((current) => ({ ...current, titulo: event.target.value }))}
                      placeholder="Titulo"
                      className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-zinc-50 placeholder:text-zinc-400 focus:border-red-500 focus:outline-none"
                    />

                    <input
                      value={topicForm.tema}
                      onChange={(event) => setTopicForm((current) => ({ ...current, tema: event.target.value }))}
                      placeholder="Tema"
                      className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-zinc-50 placeholder:text-zinc-400 focus:border-red-500 focus:outline-none"
                    />

                    <input
                      value={topicForm.ano}
                      onChange={(event) => setTopicForm((current) => ({ ...current, ano: event.target.value }))}
                      placeholder="Ano"
                      className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-zinc-50 placeholder:text-zinc-400 focus:border-red-500 focus:outline-none"
                    />

                    <input
                      value={topicForm.capaUrl}
                      onChange={(event) => setTopicForm((current) => ({ ...current, capaUrl: event.target.value }))}
                      placeholder="URL da capa"
                      className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-zinc-50 placeholder:text-zinc-400 focus:border-red-500 focus:outline-none md:col-span-2 xl:col-span-3"
                    />

                    <textarea
                      value={topicForm.descricao}
                      onChange={(event) => setTopicForm((current) => ({ ...current, descricao: event.target.value }))}
                      placeholder="Descricao"
                      rows={4}
                      className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-zinc-50 placeholder:text-zinc-400 focus:border-red-500 focus:outline-none md:col-span-2 xl:col-span-3"
                    />

                    <textarea
                      value={topicForm.lore}
                      onChange={(event) => setTopicForm((current) => ({ ...current, lore: event.target.value }))}
                      placeholder="Lore do game (aparecera na pagina do topico, separe paragrafos com linha em branco)"
                      rows={6}
                      className="rounded-2xl border border-cyan-500/20 bg-zinc-950/80 px-4 py-3 text-zinc-50 placeholder:text-zinc-400 focus:border-cyan-500 focus:outline-none md:col-span-2 xl:col-span-3"
                    />

                    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-200 md:col-span-2 xl:col-span-2">
                      <input
                        type="checkbox"
                        checked={topicForm.destaque}
                        onChange={(event) => setTopicForm((current) => ({ ...current, destaque: event.target.checked }))}
                        className="h-4 w-4 rounded border-white/20 bg-zinc-900"
                      />
                      Marcar este tópico como destaque da home
                    </label>

                    <button
                      type="submit"
                      className="rounded-2xl border border-red-500/50 bg-red-500/15 px-4 py-3 text-sm font-bold uppercase tracking-[0.24em] text-red-100 transition hover:bg-red-500/25 md:col-span-2 xl:col-span-1"
                    >
                      Adicionar topico
                    </button>
                  </form>
                </section>
              ) : null}

              <SiteFooter navigationItems={navigationItems} onNavigate={openScreen} />
            </>
          ) : null}

          {screen === "topico" && selectedTopic ? (
            <TopicDetail
              game={selectedTopic}
              user={user}
              comments={topicComments}
              canModerate={isAdmin}
              onBack={handleBackToHome}
              onAddComment={handleAddTopicComment}
              onDeleteComment={handleDeleteComment}
            />
          ) : null}

          {screen === "topico" && isLoadingComments ? (
            <section className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
              Carregando comentarios...
            </section>
          ) : null}

          {screen === "login" ? (
            <AuthPanel mode="login" form={loginForm} onChange={setLoginForm} onSubmit={handleLoginSubmit} />
          ) : null}

          {screen === "cadastro" ? (
            <AuthPanel
              mode="cadastro"
              form={cadastroForm}
              onChange={setCadastroForm}
              onSubmit={handleCadastroSubmit}
            />
          ) : null}

          {notice ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-red-100 shadow-[0_20px_40px_rgba(0,0,0,0.28)]">
              {notice}
            </p>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function addReplyToTree(tree: TopicComment[], parentId: number, reply: TopicComment): TopicComment[] {
  return tree.map((comment) => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...comment.replies, reply],
      };
    }

    if (comment.replies.length > 0) {
      return {
        ...comment,
        replies: addReplyToTree(comment.replies, parentId, reply),
      };
    }

    return comment;
  });
}

function removeCommentFromTree(tree: TopicComment[], commentId: number): TopicComment[] {
  return tree
    .filter((comment) => comment.id !== commentId)
    .map((comment) => ({
      ...comment,
      replies: removeCommentFromTree(comment.replies, commentId),
    }));
}

function mapApiGameToHighlight(game: Jogo, customTheme?: string): GameHighlight {
  const badgeFromTitle = game.titulo
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();

  const badge = badgeFromTitle || `RE${game.id}`;

  return {
    id: `db-${game.id}`,
    dbId: game.id,
    title: game.titulo,
    image: game.capaUrl,
    badge,
    theme: customTheme?.trim() || "Sobrevivência",
    keywords: [game.titulo, game.descricao, String(game.ano), badge, customTheme || "Sobrevivência"],
    summary: game.descricao,
    lore: game.lore?.trim() || "",
    featured: game.destaque,
    commentCount: game.comentarios?.length ?? 0,
  };
}

function countCommentsTree(tree: TopicComment[]): number {
  return tree.reduce((acc, comment) => acc + 1 + countCommentsTree(comment.replies), 0);
}

function buildCommentsTree(rawComments: RawComentario[]): TopicComment[] {
  const mapped = rawComments.map<TopicComment>((comment) => ({
    id: comment.id,
    jogoId: comment.jogoId,
    parentId: comment.parentId ?? null,
    userName: comment.admin?.nome || comment.usuario?.nome || "Usuario",
    userRole: comment.admin ? "admin" : "usuario",
    text: comment.texto,
    createdAt: comment.criadoEm,
    replies: [],
  }));

  const byId = new Map<number, TopicComment>();
  for (const comment of mapped) {
    byId.set(comment.id, comment);
  }

  const roots: TopicComment[] = [];
  for (const comment of mapped) {
    if (comment.parentId) {
      const parent = byId.get(comment.parentId);
      if (parent) {
        parent.replies.push(comment);
      } else {
        roots.push(comment);
      }
    } else {
      roots.push(comment);
    }
  }

  return roots;
}
