import type { GameHighlight } from "../types";

type GameCardProps = {
  game: GameHighlight;
  featured?: boolean;
  onOpen?: (game: GameHighlight) => void;
  onDelete?: (game: GameHighlight) => void;
  showDeleteAction?: boolean;
};

export function GameCard({ game, featured = false, onOpen, onDelete, showDeleteAction = false }: GameCardProps) {
  const isInteractive = Boolean(onOpen);

  return (
    <article
      className={[
        "group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-950 shadow-[0_24px_60px_rgba(0,0,0,0.55)]",
        featured ? "min-h-[18rem] sm:min-h-[30rem] sm:col-span-2 sm:row-span-2" : "min-h-[18rem]",
        isInteractive ? "cursor-pointer transition hover:-translate-y-0.5 hover:border-red-400/45" : "",
      ].join(" ")}
      onClick={() => onOpen?.(game)}
    >
      {showDeleteAction ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete?.(game);
          }}
          className="absolute right-3 top-3 z-20 rounded-full border border-red-400/50 bg-black/65 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-red-100 transition hover:bg-red-500/25"
        >
          Excluir
        </button>
      ) : null}

      <img
        src={game.image}
        alt={game.title}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.94),rgba(0,0,0,0.25))]" />

      <div className="absolute inset-x-0 bottom-0 z-10 space-y-2.5 p-4 sm:space-y-3 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.3em] text-red-100">
            {game.theme}
          </span>
        </div>

        <h2 className={featured ? "max-w-xl text-2xl leading-tight sm:text-5xl" : "max-w-lg text-lg leading-tight sm:text-2xl"}>
          {game.title}
        </h2>

        <p className={featured ? "max-w-xl text-sm leading-5 text-zinc-200/85 sm:text-base sm:leading-6" : "hidden max-w-xl text-sm leading-5 text-zinc-200/85 sm:block sm:text-base sm:leading-6"}>
          {game.summary}
        </p>
      </div>
    </article>
  );
}