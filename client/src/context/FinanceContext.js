import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0, categories: {} });
  const [loadingData, setLoadingData] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const [accsRes, txRes, sumRes] = await Promise.all([
        api.get('/accounts'),
        api.get(`/transactions?month=${month}&year=${year}`),
        api.get(`/transactions/summary?month=${month}&year=${year}`),
      ]);
      setAccounts(accsRes.data);
      setTransactions(txRes.data);
      setSummary(sumRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoadingData(false);
    }
  }, [user, month, year]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fetchAllTransactions = useCallback(async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const res = await api.get(`/transactions?${params}`);
    return res.data;
  }, []);

  // Accounts CRUD
  const addAccount = useCallback(async (data) => {
    const res = await api.post('/accounts', data);
    await fetchAll();
    return res.data;
  }, [fetchAll]);

  const updateAccount = useCallback(async (id, data) => {
    const res = await api.put(`/accounts/${id}`, data);
    await fetchAll();
    return res.data;
  }, [fetchAll]);

  const deleteAccount = useCallback(async (id) => {
    await api.delete(`/accounts/${id}`);
    await fetchAll();
  }, [fetchAll]);

  // Transactions CRUD
  const addTransaction = useCallback(async (data) => {
    const res = await api.post('/transactions', data);
    await fetchAll();
    return res.data;
  }, [fetchAll]);

  const updateTransaction = useCallback(async (id, data) => {
    const res = await api.put(`/transactions/${id}`, data);
    await fetchAll();
    return res.data;
  }, [fetchAll]);

  const deleteTransaction = useCallback(async (id) => {
    await api.delete(`/transactions/${id}`);
    await fetchAll();
  }, [fetchAll]);

  const changeMonth = useCallback((dir) => {
    setMonth(prev => {
      let m = prev + dir;
      if (m < 0) { setYear(y => y - 1); return 11; }
      if (m > 11) { setYear(y => y + 1); return 0; }
      return m;
    });
  }, []);

  return (
    <FinanceContext.Provider value={{
      month, year, changeMonth,
      accounts, transactions, summary,
      loadingData, fetchAll, fetchAllTransactions,
      addAccount, updateAccount, deleteAccount,
      addTransaction, updateTransaction, deleteTransaction,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => useContext(FinanceContext);
