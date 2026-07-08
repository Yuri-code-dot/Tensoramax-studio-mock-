import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Company } from '../lib/types';
import { apiGet, apiSend } from '../lib/api';

export interface CompanyInput {
  name: string;
  gstin: string;
  pan: string;
  state: string;
  address: string;
  fy_start: string;
  fy_end: string;
}

interface Ctx {
  companies: Company[];
  company: Company | null;
  loading: boolean;
  error: string | null;
  setActive: (id: number) => Promise<void>;
  createCompany: (input: CompanyInput) => Promise<Company>;
  updateCompany: (id: number, input: CompanyInput) => Promise<void>;
  deleteCompany: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const CompanyContext = createContext<Ctx>({
  companies: [],
  company: null,
  loading: true,
  error: null,
  setActive: async () => {},
  createCompany: async () => ({} as Company),
  updateCompany: async () => {},
  deleteCompany: async () => {},
  refresh: async () => {},
});

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await apiGet<Company[]>('/companies');
      setCompanies(data);
      setCompany((prev) => {
        const active = data.find((c) => c.is_active) || data[0] || null;
        if (prev) {
          const still = data.find((c) => c.id === prev.id);
          return still || active;
        }
        return active;
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setActive = async (id: number) => {
    const next = companies.find((c) => c.id === id) || null;
    setCompany(next);
    setCompanies((prev) => prev.map((c) => ({ ...c, is_active: c.id === id })));
    try {
      await apiSend('/companies', 'PUT', { id, activate: true });
    } catch {
      /* keep optimistic state */
    }
  };

  const createCompany = async (input: CompanyInput) => {
    const created = await apiSend<Company>('/companies', 'POST', input);
    await apiSend('/companies', 'PUT', { id: created.id, activate: true });
    await refresh();
    setCompany({ ...created, is_active: true });
    return created;
  };

  const updateCompany = async (id: number, input: CompanyInput) => {
    await apiSend('/companies', 'PUT', { id, ...input });
    await refresh();
  };

  const deleteCompany = async (id: number) => {
    await apiSend('/companies', 'DELETE', { id });
    if (company?.id === id) setCompany(null);
    await refresh();
  };

  return (
    <CompanyContext.Provider value={{ companies, company, loading, error, setActive, createCompany, updateCompany, deleteCompany, refresh }}>
      {children}
    </CompanyContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCompany = () => useContext(CompanyContext);
