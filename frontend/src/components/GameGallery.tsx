import type { GameHighlight } from "../types";
import { GameCard } from "./GameCard";

type GameGalleryProps = {
  games: GameHighlight[];
  mode?: "usuario" | "admin";
  onOpenTopic?: (game: GameHighlight) => void;
  onDeleteTopic?: (game: GameHighlight) => void;
};

export function GameGallery({ games, mode = "usuario", onOpenTopic, onDeleteTopic }: GameGalleryProps) {
  if (games.length === 0) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-zinc-200 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <h1 className="text-3xl uppercase tracking-[0.28em] text-red-100">Sem resultados</h1>
        <p className="mt-3 text-base text-zinc-300">
          Ajuste a busca ou troque o tema para encontrar outro jogo da franquia.
        </p>
      </section>
    );
  }

  if (mode === "admin") {
    return (
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {games.map((game) => (
          <GameCard key={game.id} game={game} onOpen={onOpenTopic} onDelete={onDeleteTopic} showDeleteAction />
        ))}
      </section>
    );
  }

  const featuredIndex = games.findIndex((game) => game.featured);
  const safeFeaturedIndex = featuredIndex >= 0 ? featuredIndex : 0;
  const featuredGame = games[safeFeaturedIndex];
  const secondaryGames = games.filter((game) => game.id !== featuredGame.id);

  return (
    <section className="grid auto-rows-[18rem] gap-3 sm:auto-rows-[18rem] sm:grid-cols-2 xl:auto-rows-[18rem] xl:grid-cols-3">
      <GameCard key={featuredGame.id} game={featuredGame} featured onOpen={onOpenTopic} />

      {secondaryGames.map((game) => (
        <GameCard key={game.id} game={game} onOpen={onOpenTopic} />
      ))}
    </section>
  );
}