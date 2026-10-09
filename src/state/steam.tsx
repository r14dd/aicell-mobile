import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { getSteam, type SteamAccount, type SteamInfo } from '@/api/steam';
import { useQuery } from '@/api/query';
import { steamAmounts, steamLimits } from '@/data/mock';

export type { SteamAccount };

type SteamState = SteamInfo & {
  /** Reloads the saved accounts, e.g. after a top-up that saved a new one. */
  refresh: () => Promise<void>;
};

const seed: SteamInfo = { accounts: [], chips: steamAmounts, limits: steamLimits };

const SteamContext = createContext<SteamState>({ ...seed, refresh: async () => {} });

export function SteamProvider({ children }: { children: ReactNode }) {
  const { data, refresh } = useQuery('billing/steam/accounts/', getSteam, seed);
  const info = data ?? seed;
  const value = useMemo(() => ({ ...info, refresh }), [info, refresh]);
  return <SteamContext.Provider value={value}>{children}</SteamContext.Provider>;
}

export const useSteam = () => useContext(SteamContext);
