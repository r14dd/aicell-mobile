import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

import { useQuery } from '@/api/query';
import { getStoryChips, markStoryViewed } from '@/api/stories';
import { useSession } from '@/state/session';

type StoriesState = { viewed: ReadonlySet<string>; markViewed: (key: string) => void };

const StoriesContext = createContext<StoriesState>({ viewed: new Set(), markViewed: () => {} });

/** Which story chips were opened; viewed chips move to the end of the row like the real app. */
export function StoriesProvider({ children }: { children: ReactNode }) {
  const { signedIn } = useSession();
  const [opened, setOpened] = useState<ReadonlySet<string>>(new Set());
  const reported = useRef(new Set<string>());
  const { data: chips } = useQuery(signedIn ? 'content/stories/' : null, getStoryChips);

  // The server keeps viewed stories between launches; what was opened this session shows before it answers.
  const viewed = useMemo(() => new Set([...opened, ...(chips?.results ?? []).filter((c) => c.viewed).map((c) => c.key)]), [opened, chips]);

  const markViewed = useCallback((key: string) => {
    setOpened((prev) => (prev.has(key) ? prev : new Set([...prev, key])));
    if (reported.current.has(key)) return;
    reported.current.add(key);
    markStoryViewed(key).catch(() => reported.current.delete(key));
  }, []);

  const value = useMemo(() => ({ viewed, markViewed }), [viewed, markViewed]);
  return <StoriesContext.Provider value={value}>{children}</StoriesContext.Provider>;
}

export const useStories = () => useContext(StoriesContext);
