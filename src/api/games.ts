import { api } from '@/api/client';
import { games as seedGames, rewardGames as seedRewardGames, type Game, type Tournament } from '@/data/games';

type ApiGame = { id: string; name: string; image: string };
type ApiGames = {
  games: ApiGame[];
  reward_games: ApiGame[];
  tournament: { title: string; game: string; prize: string; participants: number; ends_at: string; cta: string };
};
export type GamesCatalog = { games: Game[]; rewardGames: Game[]; tournament: Tournament };

/** Server images are not served to the app, so a game uses its bundled icon when it has one. */
const localIcons = new Map([...seedGames, ...seedRewardGames].map((g) => [g.id, g.image]));
const toGame = (g: ApiGame): Game => ({ id: g.id, name: g.name, image: localIcons.get(g.id) ?? { uri: g.image } });

function toCatalog(res: ApiGames): GamesCatalog {
  // The server catalogue is placeholder content without artwork; the recorded grid stays until every game it lists has an icon here.
  const complete = (list: ApiGame[]) => list.length > 0 && list.every((g) => localIcons.has(g.id));
  const games = complete(res.games) ? res.games.map(toGame) : seedGames;
  const rewardGames = complete(res.reward_games) ? res.reward_games.map(toGame) : seedRewardGames;
  const t = res.tournament;
  const game = [...games, ...rewardGames].find((g) => g.id === t.game) ?? [...res.games, ...res.reward_games].find((g) => g.id === t.game);
  return { games, rewardGames, tournament: { title: t.title, game: game?.name ?? t.game, prize: t.prize, participants: t.participants, cta: t.cta, endsAt: Date.parse(t.ends_at) } };
}

export const getGames = () => api<ApiGames>('content/games/').then(toCatalog);
/** Answers 501 until the server has game search; the caller shows the notice it carries. */
export const searchGames = (q: string) => api<ApiGames>(`content/games/?q=${encodeURIComponent(q)}`);
