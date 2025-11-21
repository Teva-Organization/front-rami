import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAreasList } from '../useAreasList';
import type { Plant } from '@/entities/plant';
import { AreasDataProvider, useAreasData } from '@/features/areas/context/AreasDataContext';
import React from 'react';

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

vi.mock('@/shared/ui/ToastProvider', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

const fetchPlantsMock = vi.fn();
vi.mock('../../api/plant.client', async () => {
  const actual = await vi.importActual('../../api/plant.client');
  return {
    ...actual,
    fetchPlants: fetchPlantsMock,
  };
});

function ProviderWithInitialSnapshot({ children, areas }: { children: React.ReactNode; areas: Plant[] }) {
  const Setter = () => {
    const { setSnapshot } = useAreasData();
    setSnapshot(areas);
    return null;
  };
  return (
    <AreasDataProvider>
      <Setter />
      {children}
    </AreasDataProvider>
  );
}

describe('useAreasList snapshot behavior', () => {
  it('usa snapshot inicial quando fetch ainda não ocorreu', async () => {
    const initialAreas: Plant[] = [
      { id: 1, areaLocationName: 'Snapshot', areaSize: 1 } as Plant,
    ];
    fetchPlantsMock.mockResolvedValue({ items: initialAreas });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProviderWithInitialSnapshot areas={initialAreas}>{children}</ProviderWithInitialSnapshot>
    );

    const { result } = renderHook(() => useAreasList(), { wrapper });

    expect(result.current.areas).toEqual(initialAreas);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetchPlantsMock).toHaveBeenCalled();
  });
});
