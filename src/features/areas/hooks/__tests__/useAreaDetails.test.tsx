import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Plant } from '@/entities/plant';
import { useAreaDetails } from '../useAreaDetails';
import { AreasDataProvider } from '@/features/areas/context/AreasDataContext';

declare const global: typeof globalThis & { __AREA_CACHE__?: Map<number, Plant> };

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

const showToast = vi.fn();
vi.mock('@/shared/ui/ToastProvider', () => ({
  useToast: () => ({ showToast }),
}));

const getPlantByIdMock = vi.fn();
vi.mock('../../api/plant.client', async () => {
  const actual = await vi.importActual('../../api/plant.client');
  return {
    ...actual,
    getPlantById: getPlantByIdMock,
  };
});

vi.mock('../../model/area-cache', () => {
  const cache = new Map<number, Plant>();
  return {
    getAreaFromCache: (id: any) => cache.get(Number(id)) ?? null,
    setAreaCache: (area: Plant) => {
      if (area?.id) cache.set(area.id, area);
    },
  };
});

describe('useAreaDetails', () => {
  beforeEach(() => {
    getPlantByIdMock.mockReset();
    showToast.mockReset();
  });

  it('utiliza dados do cache antes de buscar do backend', async () => {
    const cachedArea = { id: 10, areaLocationName: 'Área Cacheada' } as Plant;
    const { setAreaCache } = require('../../model/area-cache');
    setAreaCache(cachedArea);
    getPlantByIdMock.mockResolvedValue({ ...cachedArea, areaLocationName: 'Área Atualizada' });

    const { result } = renderHook(() => useAreaDetails('10'), { wrapper: AreasDataProvider });

    expect(result.current.area).toEqual(cachedArea);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.area?.areaLocationName).toBe('Área Atualizada');
  });

  it('exibe toast ao falhar na carga', async () => {
    getPlantByIdMock.mockRejectedValue(new Error('Falha'));
    const { result } = renderHook(() => useAreaDetails('11'), { wrapper: AreasDataProvider });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(showToast).toHaveBeenCalled();
    expect(result.current.area).toBeNull();
  });
});
