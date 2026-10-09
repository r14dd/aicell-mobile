import { api } from '@/api/client';
import type { HomeFeed } from '@/api/content';
import type { Story } from '@/data/stories';

export type ApiStory = {
  key: string;
  title: string;
  thumb: string;
  prev_key: string | null;
  next_key: string | null;
  pages: { title: string; body: string; cta: { label: string; deep_link: string | null } | null; image: string; duration_ms: number }[];
};

export const getStoryChips = () => api<{ results: HomeFeed['stories'] }>('content/stories/');
export const getStory = (key: string) => api<ApiStory>(`content/stories/${key}/`);
export const markStoryViewed = (key: string) => api<{ key: string; viewed: boolean }>(`content/stories/${key}/viewed/`, { method: 'POST' });

/**
 * Keeps the recorded copy, artwork and timing of the local story and takes only what the server adds:
 * the neighbour keys (read by the viewer) and a call-to-action deep link. The catalogue texts on the
 * server are placeholders, so they never replace the copy captured from the real app.
 */
export function withApiStory(local: Story, remote: ApiStory | undefined): Story {
  if (!remote) return local;
  return {
    ...local,
    pages: local.pages.map((page, i) => {
      const link = remote.pages[i]?.cta?.deep_link;
      return link && page.cta ? { ...page, href: link } : page;
    }),
  };
}
