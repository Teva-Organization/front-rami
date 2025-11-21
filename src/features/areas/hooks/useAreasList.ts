import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Plant } from '@/entities/plant';
import { fetchPlants } from '../api/plant.client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToast } from '@/shared/ui/ToastProvider';
import type { PaginationParams } from '@/features/configuracoes/model/pagination';
import { setAreasCache } from '../model/area-cache';
import { useAreasData } from '../context/AreasDataContext';

const DEFAULT_PARAMS: Required<Pick<PaginationParams, 'page' | 'pageSize'>> = {
  page: 1,
  pageSize: 50,
};

export type UseAreasListParams = Partial<Pick<PaginationParams, 'page' | 'pageSize'>>;

export function useAreasList(params: UseAreasListParams = DEFAULT_PARAMS, initialAreas: Plant[] = []) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { snapshot, setSnapshot } = useAreasData();
  const fallback = initialAreas.length ? initialAreas : snapshot;
  const [areas, setAreas] = useState<Plant[]>(fallback);
  const [isLoading, setIsLoading] = useState(false);

  const pagination = useMemo(() => ({
    page: params.page ?? DEFAULT_PARAMS.page,
    pageSize: params.pageSize ?? DEFAULT_PARAMS.pageSize,
  }), [params.page, params.pageSize]);

  const loadAreas = useCallback(async () => {
    if (!user) {
      setAreas(fallback);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchPlants({ ...pagination });
      const list = Array.isArray(response) ? response : response?.items ?? fallback;
      setAreas(list);
      setAreasCache(list);
      setSnapshot(list);
    } catch (error: any) {
      setAreas([]);
      showToast({
        title: 'Ops!',
        description: error?.response?.data?.message ?? 'Não foi possível carregar as áreas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [pagination, showToast, user]);

  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  return { areas, isLoading, reload: loadAreas };
}
