import type { GameHighlight } from "../types";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function filterGames(games: GameHighlight[], query: string) {
  const normalizedQuery = normalize(query);

  return games.filter((game) => {
    if (!normalizedQuery) {
      return true;
    }

    const searchBlob = normalize([
      game.title,
      game.badge,
      game.theme,
      game.summary,
      ...game.keywords,
    ].join(" "));

    return normalizedQuery.split(/\s+/).every((token) => searchBlob.includes(token));
  });
}