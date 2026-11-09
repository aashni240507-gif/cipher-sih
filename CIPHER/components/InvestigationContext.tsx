"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { InvestigationRecord } from "@/lib/investigation-service";

interface InvestigationContextValue {
  activeInvestigationId: string;
  activeCaseId: string;
  activeCaseTitle: string;
  activeInvestigation: InvestigationRecord | null;
  investigations: InvestigationRecord[];
  setActiveInvestigationId: (idOrCaseId: string) => void;
  refreshInvestigations: () => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_CASE_ID = "INV-2026-0142";
const STORAGE_KEY = "cipher_active_investigation_id";

const InvestigationContext = createContext<InvestigationContextValue>({
  activeInvestigationId: "inv-001",
  activeCaseId: DEFAULT_CASE_ID,
  activeCaseTitle: "Operation Nexus",
  activeInvestigation: null,
  investigations: [],
  setActiveInvestigationId: () => {},
  refreshInvestigations: async () => {},
  isLoading: true,
});

export function InvestigationProvider({ children }: { children: React.ReactNode }) {
  const [investigations, setInvestigations] = useState<InvestigationRecord[]>([]);
  const [activeInvestigationId, setActiveIdState] = useState<string>("inv-001");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load all investigations from API
  const refreshInvestigations = useCallback(async () => {
    try {
      const res = await fetch("/api/investigations");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.investigations)) {
          setInvestigations(data.investigations);
        }
      }
    } catch (err) {
      console.error("[InvestigationContext] Error loading investigations:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load & restore saved investigation
  useEffect(() => {
    refreshInvestigations();
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setActiveIdState(saved);
      }
    }
  }, [refreshInvestigations]);

  const setActiveInvestigationId = useCallback(
    (idOrCaseId: string) => {
      setActiveIdState(idOrCaseId);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, idOrCaseId);
        // Also dispatch custom event for non-react listeners if needed
        window.dispatchEvent(
          new CustomEvent("cipher-investigation-changed", { detail: { id: idOrCaseId } })
        );
      }
    },
    []
  );

  // Find active investigation record
  const activeInvestigation =
    investigations.find(
      (inv) =>
        inv.id.toLowerCase() === activeInvestigationId.toLowerCase() ||
        inv.caseId.toLowerCase() === activeInvestigationId.toLowerCase()
    ) ||
    investigations[0] ||
    null;

  const activeCaseId = activeInvestigation?.caseId || DEFAULT_CASE_ID;
  const activeCaseTitle = activeInvestigation?.title || "Operation Nexus";

  return (
    <InvestigationContext.Provider
      value={{
        activeInvestigationId: activeInvestigation?.id || activeInvestigationId,
        activeCaseId,
        activeCaseTitle,
        activeInvestigation,
        investigations,
        setActiveInvestigationId,
        refreshInvestigations,
        isLoading,
      }}
    >
      {children}
    </InvestigationContext.Provider>
  );
}

export function useInvestigation() {
  return useContext(InvestigationContext);
}
