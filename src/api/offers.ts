import type { Href } from 'expo-router';

import { api } from '@/api/client';
import { getBanners } from '@/api/content';
import { img } from '@/data/assets';
import { homeBanners, partnerPerks, productBanners, type Banner } from '@/data/mock';

type ApiOffer = { id: string; name: string; sub: string; image: string; deep_link: string | null };
export type Campaign = { id: string; title: string; image: number | { uri: string }; href?: string };

/** The bundled rasters, found by banner key: server images are not served to the app. */
const bannerPool = [...homeBanners, ...productBanners, ...partnerPerks];

/** Banners without a bundled raster cannot be drawn and are left out. */
export const getPartnerBanners = () =>
  getBanners('partners').then((res) =>
    res.results.flatMap((b): Banner[] => {
      const local = bannerPool.find((l) => l.key === b.key);
      return local ? [{ key: b.key, image: local.image, alt: b.alt, href: (b.deep_link ?? undefined) as Href | undefined, note: local.note }] : [];
    }),
  );

const campaignImages: Record<string, number> = { azercellim: img.campaignMan };

export const getCampaigns = () =>
  api<{ results: ApiOffer[] }>('content/campaigns/').then((res): Campaign[] =>
    res.results.map((o) => ({ id: o.id, title: o.name, image: campaignImages[o.id] ?? { uri: o.image }, href: o.deep_link ?? undefined })),
  );
