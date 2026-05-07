import { FormEvent, useMemo, useState } from "react";
import type { AuthResponse, GameHighlight, TopicComment } from "../types";

type TopicDetailProps = {
  game: GameHighlight;
  user: AuthResponse | null;
  comments: TopicComment[];
  canModerate: boolean;
  onBack: () => void;
  onAddComment: (text: string, parentId?: number) => void;
  onDeleteComment: (id: number) => void;
};

export function TopicDetail({ game, user, comments, canModerate, onBack, onAddComment, onDeleteComment }: TopicDetailProps) {
  const [commentText, setCommentText] = useState("");

  const paragraphs = useMemo(() => buildTopicParagraphs(game), [game]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      return;
    }

    const text = commentText.trim();
    if (!text) {
      return;
    }

    onAddComment(text);
    setCommentText("");
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(165deg,rgba(7,15,27,0.95),rgba(4,8,14,0.98))] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.38)] sm:p-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-zinc-100 transition hover:border-red-400/50 hover:text-red-200"
      >
        Voltar para os tópicos
      </button>

      <article className="grid gap-5 rounded-[1.5rem] border border-blue-300/20 bg-[#031022] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.35)] sm:grid-cols-[250px_minmax(0,1fr)] sm:p-5">
        <div className="space-y-3">
          <img
            src={game.image}
            alt={game.title}
            className="h-[180px] w-full rounded-xl border border-white/10 object-cover shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
          />

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/35 bg-cyan-500/10 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-cyan-100">
              {game.theme}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <header>
            <h1 className="text-3xl leading-tight text-cyan-100 sm:text-4xl">{game.title}</h1>
            <p className="mt-2 text-sm text-zinc-300">Análise da comunidade Resident Evil Forum</p>
          </header>

          <div className="space-y-3 text-base leading-8 text-zinc-200/90">
            {paragraphs.map((paragraph, index) => (
              <p key={`${game.id}-${index}`}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>

      <section className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/25 p-4 sm:p-5">
        <h2 className="text-2xl text-red-100">Comentários dos usuários</h2>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
          <textarea
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Escreva seu comentário sobre este tópico"
            rows={4}
            className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-zinc-50 placeholder:text-zinc-400 focus:border-red-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!user}
            className="w-fit rounded-2xl border border-red-500/50 bg-red-500/15 px-4 py-3 text-sm font-bold uppercase tracking-[0.24em] text-red-100 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Comentar
          </button>
        </form>

        <div className="mt-4 space-y-3">
          {comments.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
              Ainda não há comentários. Seja o primeiro a contribuir.
            </p>
          ) : (
            comments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                user={user}
                canModerate={canModerate}
                onReply={onAddComment}
                onDelete={onDeleteComment}
              />
            ))
          )}
        </div>
      </section>
    </section>
  );
}

function buildTopicParagraphs(game: GameHighlight) {
  if (game.lore.trim()) {
    return game.lore
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  return [game.summary];
}

function formatCommentDate(createdAt: string) {
  const date = new Date(createdAt);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type CommentThreadProps = {
  comment: TopicComment;
  user: AuthResponse | null;
  canModerate: boolean;
  onReply: (text: string, parentId?: number) => void;
  onDelete: (id: number) => void;
};

function CommentThread({ comment, user, canModerate, onReply, onDelete }: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  function handleReplySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      return;
    }

    const text = replyText.trim();
    if (!text) {
      return;
    }

    onReply(text, comment.id);
    setReplyText("");
    setIsReplying(false);
  }

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <strong className="text-sm text-red-100">{comment.userName}</strong>
          <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.2em] text-zinc-300">
            {comment.userRole}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">{formatCommentDate(comment.createdAt)}</span>
          {canModerate ? (
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              className="rounded-full border border-red-500/45 bg-red-500/10 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-red-100 transition hover:bg-red-500/20"
            >
              Excluir
            </button>
          ) : null}
        </div>
      </div>

      <p className="text-sm leading-6 text-zinc-200/90">{comment.text}</p>

      <div className="mt-3">
        <button
          type="button"
          disabled={!user}
          onClick={() => setIsReplying((current) => !current)}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-zinc-200 transition hover:border-red-400/40 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Responder
        </button>
      </div>

      {isReplying ? (
        <form onSubmit={handleReplySubmit} className="mt-3 grid gap-2">
          <textarea
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            rows={3}
            placeholder="Escreva sua resposta"
            className="rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-400 focus:border-red-500 focus:outline-none"
          />

          <button
            type="submit"
            className="w-fit rounded-xl border border-red-500/50 bg-red-500/15 px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-red-100 transition hover:bg-red-500/25"
          >
            Enviar resposta
          </button>
        </form>
      ) : null}

      {comment.replies.length > 0 ? (
        <div className="mt-3 space-y-2 border-l border-white/10 pl-3 sm:pl-5">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              user={user}
              canModerate={canModerate}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
