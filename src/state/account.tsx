import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import { getBalance, getTransactions, toTransaction, type ApiTransaction, type Balance, type MoneyResponse, type Page } from '@/api/billing';
import { num } from '@/api/client';
import { getQueryData, invalidate, setQueryData, useQuery } from '@/api/query';
import { money, subscriber, transactions as seedTransactions, type Transaction } from '@/data/mock';
import { useSession } from '@/state/session';

const BALANCE_KEY = 'billing/balance/';
const TRANSACTIONS_KEY = 'billing/transactions/?limit=20';

type AccountState = {
  balance: number;
  topUpsThisMonth: number;
  transactions: Transaction[];
  /** The server has answered at least once; before that the seed values show. */
  loaded: boolean;
  /** Applies the `balance` and `transaction` every money endpoint returns, so no extra balance call is needed. */
  applyMoney: (res: MoneyResponse) => void;
  /** Reloads balance and recent transactions. */
  refresh: () => Promise<void>;
  /** Deducts a purchase locally. Transitional: screens move to their money endpoints and `applyMoney`. */
  charge: (amount: number, title: string) => boolean;
};

const AccountContext = createContext<AccountState>({
  balance: subscriber.balance,
  topUpsThisMonth: subscriber.topUpsThisMonth,
  transactions: seedTransactions,
  loaded: false,
  applyMoney: () => {},
  refresh: async () => {},
  charge: () => false,
});

const nowIso = () => new Date().toISOString();

/** Writes a money answer into the cached balance and transaction list. */
function recordMoney(res: MoneyResponse) {
  const prev = getQueryData<Balance>(BALANCE_KEY);
  const amount = num(res.transaction?.amount ?? 0);
  const prevTopUps = num(prev?.top_ups_this_month ?? money(subscriber.topUpsThisMonth));
  setQueryData<Balance>(BALANCE_KEY, {
    balance: res.balance,
    currency: 'AZN',
    month: prev?.month ?? '',
    top_ups_this_month: money(amount > 0 ? prevTopUps + amount : prevTopUps),
  });
  if (res.transaction) {
    const list = getQueryData<Page<ApiTransaction>>(TRANSACTIONS_KEY);
    const entry: ApiTransaction = { id: res.transaction.id, kind: amount > 0 ? 'top_up' : 'purchase', title: res.transaction.title, amount: res.transaction.amount, created_at: nowIso() };
    setQueryData<Page<ApiTransaction>>(TRANSACTIONS_KEY, { next: list?.next ?? null, results: [entry, ...(list?.results ?? [])] });
  }
  invalidate('billing/top-ups/');
  invalidate('insights/');
  invalidate('usage/');
}

/** Balance and recent transactions live in the query cache; money answers are written straight into it. */
export function AccountProvider({ children }: { children: ReactNode }) {
  const { signedIn } = useSession();
  const balanceQuery = useQuery(signedIn ? BALANCE_KEY : null, getBalance);
  const transactionsQuery = useQuery(signedIn ? TRANSACTIONS_KEY : null, () => getTransactions(20));
  const refreshBalance = balanceQuery.refresh;
  const refreshTransactions = transactionsQuery.refresh;

  const balance = balanceQuery.data ? num(balanceQuery.data.balance) : subscriber.balance;
  const topUpsThisMonth = balanceQuery.data ? num(balanceQuery.data.top_ups_this_month) : subscriber.topUpsThisMonth;
  const transactions = useMemo(() => (transactionsQuery.data ? transactionsQuery.data.results.map(toTransaction) : seedTransactions), [transactionsQuery.data]);
  const loaded = !!balanceQuery.data;

  const applyMoney = useCallback((res: MoneyResponse) => recordMoney(res), []);
  const refresh = useCallback(async () => {
    await Promise.all([refreshBalance(), refreshTransactions()]);
  }, [refreshBalance, refreshTransactions]);

  const charge = useCallback(
    (amount: number, title: string) => {
      const value = Math.round(amount * 100) / 100;
      if (value > balance) return false;
      recordMoney({ balance: money(balance - value), transaction: { id: Date.now(), title, amount: money(-value) } });
      return true;
    },
    [balance],
  );

  const value = useMemo(
    () => ({ balance, topUpsThisMonth, transactions, loaded, applyMoney, refresh, charge }),
    [balance, topUpsThisMonth, transactions, loaded, applyMoney, refresh, charge],
  );
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export const useAccount = () => useContext(AccountContext);
