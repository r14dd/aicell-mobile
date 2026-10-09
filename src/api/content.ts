import { api, longDate } from '@/api/client';
import type { Notification } from '@/data/notifications';

export type HomeFeed = {
  stories: { key: string; label: string; image: string; viewed: boolean; has_story: boolean }[];
  quick_actions: { key: string; label: string; deep_link: string | null }[];
  banners: ApiBanner[];
  lottery: { title: string; subtitle: string; starts_at: string; cta: string; deep_link: string | null };
};
export type ApiBanner = { key: string; image: string; alt: string; deep_link: string | null };
export type ApiNotification = { id: string; title: string; body: string; cta: { label: string; deep_link: string | null } | null; sent_at: string; read: boolean };
export type NotificationsPage = { results: ApiNotification[]; next: string | null; unread: number };

export const getHome = () => api<HomeFeed>('content/home/');
export const getBanners = (placement: 'home' | 'products' | 'benefits' | 'partners') => api<{ results: ApiBanner[] }>(`content/banners/?placement=${placement}`);
export const getNotifications = (filter?: { q?: string; from?: string; to?: string }, limit = 50) => {
  const q = new URLSearchParams({ limit: String(limit) });
  if (filter?.q) q.set('q', filter.q);
  if (filter?.from) q.set('from', filter.from);
  if (filter?.to) q.set('to', filter.to);
  return api<NotificationsPage>(`content/notifications/?${q.toString()}`);
};
/** Also marks the notification read on the server. */
export const getNotification = (id: string) => api<ApiNotification>(`content/notifications/${id}/`);
export const rateApp = (stars: number) => api<{ message: string }>('content/app-rating/', { method: 'POST', body: { stars } });

export const toNotification = (n: ApiNotification): Notification => ({ id: n.id, date: longDate(n.sent_at), title: n.title, body: n.body, cta: n.cta?.label, ctaHref: n.cta?.deep_link ?? undefined });
