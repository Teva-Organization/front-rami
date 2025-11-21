import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Plant } from '@/entities/plant';

export type AreasDataContextValue = {
  snapshot: Plant[];
  setSnapshot: (areas: Plant[]) => void;
};

const AreasDataContext = createContext<AreasDataContextValue | undefined>(undefined);

export function AreasDataProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<Plant[]>([]);
  const value = useMemo(() => ({ snapshot, setSnapshot }), [snapshot]);
  return <AreasDataContext.Provider value={value}>{children}</AreasDataContext.Provider>;
}

export function useAreasData() {
  const ctx = useContext(AreasDataContext);
  if (!ctx) {
    throw new Error('useAreasData deve ser usado dentro de AreasDataProvider');
  }
  return ctx;
}
