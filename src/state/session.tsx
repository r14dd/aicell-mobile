import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ApiError, setApiTokens } from '@/api/client';
import { invalidate } from '@/api/query';
import { getMe, OTP_TEST_CODE, sendOtp, verifyOtp, type Me } from '@/api/users';
import { subscriber, type Account } from '@/data/mock';

type SessionState = {
  signedIn: boolean;
  /** The number the app is showing. */
  account: Account;
  /** Numbers linked to this login: the welcome screen's picker and the top-bar switcher. */
  accounts: Account[];
  /** OTP sign-in: `otp/send/` then `otp/verify/` with the code (the test code when none is typed). Throws an ApiError on a wrong code or unknown number. */
  signIn: (number: string, code?: string) => Promise<void>;
  signOut: () => void;
};

const digits = (value: string) => value.replace(/\D/g, '').slice(-9);
/** `051 664 33 42` → `994516643342`. */
export const msisdnOf = (number: string) => `994${digits(number)}`;

/** `516643342` → `051 664 33 42`. */
export function formatNumber(value: string) {
  const d = digits(value).padStart(9, '0');
  return `0${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`;
}

/** The seeded subscribers of the demo server, one per story; names and tariffs refresh from `users/me/`. */
export const demoAccounts: Account[] = [
  { number: '051 664 33 42', name: 'Qüdrət Abidzadə', plan: 'Prepaid', tariff: 'IsteSen' },
  { number: '050 100 00 01', name: 'Test Abunəçi 1', plan: 'Prepaid', tariff: 'DigiMax 5GB' },
  { number: '050 100 00 02', name: 'Test Abunəçi 2', plan: 'Prepaid', tariff: 'DigiMax 5GB' },
  { number: '050 100 00 03', name: 'Test Abunəçi 3', plan: 'Prepaid', tariff: 'DigiMax 10GB' },
];

/** An OTP request is good for five minutes on the server; this leaves a margin. */
const OTP_FRESH_MS = 240000;

const SessionContext = createContext<SessionState>({ signedIn: true, account: demoAccounts[0], accounts: demoAccounts, signIn: async () => {}, signOut: () => {} });

const fromMe = (me: Me): Account => ({
  number: me.display_msisdn,
  name: me.display_name,
  plan: me.line_type === 'postpaid' ? 'Postpaid' : 'Prepaid',
  tariff: demoAccounts.find((a) => msisdnOf(a.number) === me.msisdn)?.tariff ?? subscriber.tariff.name,
});

/** In-memory login state. The app starts signed in as the demo number (OTP with the test code); switching numbers signs the next one in and clears the cache. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(true);
  const [account, setAccount] = useState<Account>(demoAccounts[0]);
  // One OTP request serves several code attempts: the server allows a resend only once a minute.
  const otp = useRef<{ msisdn: string; request_id: string; at: number } | null>(null);
  // Numbers signed in during this run keep their tokens: switching back needs no new code (the server resends once a minute).
  const tokens = useRef(new Map<string, { access: string; refresh: string; me: Me }>());

  const signIn = useCallback(async (number: string, code = OTP_TEST_CODE) => {
    const msisdn = msisdnOf(number);
    const known = tokens.current.get(msisdn);
    if (known) {
      setApiTokens(known);
      invalidate('');
      setAccount(fromMe(known.me));
      setSignedIn(true);
      return;
    }
    let request = otp.current;
    if (!request || request.msisdn !== msisdn || Date.now() - request.at > OTP_FRESH_MS) {
      const { request_id } = await sendOtp(msisdn);
      request = { msisdn, request_id, at: Date.now() };
      otp.current = request;
    }
    let signedInAs;
    try {
      signedInAs = await verifyOtp(request.request_id, code);
    } catch (e) {
      // A wrong code keeps the request alive until its attempts run out; anything else needs a new one.
      if (!(e instanceof ApiError && e.code === 'invalid_code' && Number(e.body?.attempts_left) > 0)) otp.current = null;
      throw e;
    }
    otp.current = null;
    const { access, refresh, subscriber: me } = signedInAs;
    tokens.current.set(msisdn, { access, refresh, me });
    setApiTokens({ access, refresh });
    invalidate('');
    setAccount(fromMe(me));
    setSignedIn(true);
  }, []);
  const signOut = useCallback(() => {
    tokens.current.clear();
    setApiTokens(undefined);
    setSignedIn(false);
  }, []);

  // The app starts on the demo number: sign it in once so every request carries its own token.
  // A relaunch within a minute hits the server's resend limit (429), so the first sign-in keeps trying.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let alive = true;
    const attempt = (delay: number) => {
      timer = setTimeout(() => {
        signIn(demoAccounts[0].number).catch((e: unknown) => {
          if (!alive) return;
          const wait = e instanceof ApiError && e.retryAfter ? e.retryAfter * 1000 + 1000 : 15000;
          attempt(wait);
        });
      }, delay);
    };
    attempt(0);
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [signIn]);

  // The server's profile replaces the seed name/number once reachable (again after every switch).
  useEffect(() => {
    if (!signedIn) return;
    let alive = true;
    getMe()
      .then((me) => {
        if (!alive) return;
        setAccount((a) => ({ ...a, number: me.display_msisdn, name: me.display_name, plan: me.line_type === 'postpaid' ? 'Postpaid' : 'Prepaid' }));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [signedIn, account.number]);

  const value = useMemo(() => ({ signedIn, account, accounts: demoAccounts, signIn, signOut }), [signedIn, account, signIn, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
