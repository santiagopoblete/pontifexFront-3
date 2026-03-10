import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ProcessedDocument, MasterDataset } from "@/lib/financial/types";

interface FinancialStore {
  documents: ProcessedDocument[];
  master: MasterDataset | null;
  addDocument: (doc: ProcessedDocument) => void;
  removeDocument: (id: string) => void;
  replaceDocument: (id: string, doc: ProcessedDocument) => void;
  clearDocuments: () => void;
  setMaster: (m: MasterDataset | null) => void;
}

const FinancialContext = createContext<FinancialStore | null>(null);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<ProcessedDocument[]>(() => {
    try {
      const stored = localStorage.getItem("pntfx_documents");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [master, setMasterState] = useState<MasterDataset | null>(() => {
    try {
      const stored = localStorage.getItem("pntfx_master");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const persist = (docs: ProcessedDocument[], m: MasterDataset | null) => {
    try {
      localStorage.setItem("pntfx_documents", JSON.stringify(docs));
      if (m) localStorage.setItem("pntfx_master", JSON.stringify(m));
      else localStorage.removeItem("pntfx_master");
    } catch { /* quota exceeded, ignore */ }
  };

  const addDocument = useCallback((doc: ProcessedDocument) => {
    setDocuments(prev => {
      const next = [...prev, doc];
      persist(next, master);
      return next;
    });
  }, [master]);

  const removeDocument = useCallback((id: string) => {
    setDocuments(prev => {
      const next = prev.filter(d => d.meta.id !== id);
      persist(next, master);
      return next;
    });
  }, [master]);

  const replaceDocument = useCallback((id: string, doc: ProcessedDocument) => {
    setDocuments(prev => {
      const next = prev.map(d => d.meta.id === id ? doc : d);
      persist(next, master);
      return next;
    });
  }, [master]);

  const clearDocuments = useCallback(() => {
    setDocuments([]);
    setMasterState(null);
    persist([], null);
  }, []);

  const setMaster = useCallback((m: MasterDataset | null) => {
    setMasterState(m);
    persist(documents, m);
  }, [documents]);

  return (
    <FinancialContext.Provider value={{ documents, master, addDocument, removeDocument, replaceDocument, clearDocuments, setMaster }}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancialStore() {
  const ctx = useContext(FinancialContext);
  if (!ctx) throw new Error("useFinancialStore must be used within FinancialProvider");
  return ctx;
}
