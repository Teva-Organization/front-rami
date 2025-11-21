import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAreasList } from '../useAreasList';
import type { Plant } from '@/entities/plant';
import { AreasDataProvider } from '@/features/areas/context/AreasDataContext';

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

const showToast = vi.fn();

vi.mock('@/shared/ui/ToastProvider', () => ({
  useToast: () => ({ showToast }),
}));

const fetchPlantsMock = vi.fn();
vi.mock('../../api/plant.client', async () => {
  const actual = await vi.importActual('../../api/plant.client');
  return {
    ...actual,
    fetchPlants: fetchPlantsMock,
  };
});

describe('useAreasList', () => {
  beforeEach(() => {
    fetchPlantsMock.mockReset();
    showToast.mockReset();
  });

  it('carrega as áreas ao montar', async () => {
    const mockAreas: Plant[] = [
      {
        id: 1,
        areaSize: 1,
        soilCorrection: false,
        fertileIrrigation: true,
        seed: true,
        areaLocationName: 'Talhão Teste',
      } as Plant,
    ];
    fetchPlantsMock.mockResolvedValue({ items: mockAreas });

    const { result } = renderHook(() => useAreasList(), { wrapper: AreasDataProvider });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.areas).toEqual(mockAreas);
    expect(fetchPlantsMock).toHaveBeenCalled();
  });

  it('exibe toast ao falhar', async () => {
    fetchPlantsMock.mockRejectedValue(new Error('erro'));
    const { result } = renderHook(() => useAreasList(), { wrapper: AreasDataProvider });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(showToast).toHaveBeenCalled();
    expect(result.current.areas).toEqual([]);
  });
});
