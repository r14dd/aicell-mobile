// Game icons cropped from the Games screen frame (see PRODUCT.md, Evidence on Hand).
export type Game = { id: string; name: string; image: number | { uri: string } };

/** `endsAt` is an epoch in ms; without one the screen counts down from when it opened. */
export type Tournament = { title: string; game: string; prize: string; participants: number; cta: string; endsAt?: number };

export const games: Game[] = [
  { id: 'ninja-saga-2', name: 'Ninja Saga 2', image: require('@/assets/images/ref/game-ninja-saga-2.png') },
  { id: 'cross-the-road', name: 'Cross the Road', image: require('@/assets/images/ref/game-cross-the-road.png') },
  { id: 'magic-of-numbers', name: 'Magic of Numbers', image: require('@/assets/images/ref/game-magic-of-numbers.png') },
  { id: 'cat-sphere', name: 'Cat Sphere', image: require('@/assets/images/ref/game-cat-sphere.png') },
  { id: 'color-bricks', name: 'Color Bricks', image: require('@/assets/images/ref/game-color-bricks.png') },
  { id: 'fast-math', name: 'Fast Math', image: require('@/assets/images/ref/game-fast-math.png') },
  { id: 'house-painter', name: 'House Painter', image: require('@/assets/images/ref/game-house-painter.png') },
  { id: 'checkers', name: 'Checkers', image: require('@/assets/images/ref/game-checkers.png') },
];

export const rewardGames: Game[] = [
  { id: 'battle-for-gb', name: 'Battle for GB', image: require('@/assets/images/ref/game-battle-for-gb.png') },
];

export const tournament: Tournament = { title: 'Tournament', game: 'Ninja Saga 2', prize: '5 GB', participants: 6708, cta: 'Participate in the tournament' };
