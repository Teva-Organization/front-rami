import { useCallback, useEffect, useState } from 'react';
import { fetchCrops } from '../api/crop.client';
import { useToast } from '@/shared/ui/ToastProvider';

export type CropOption = { id: number; description: string };

export function useCropsOptions(page = 1, pageSize = 200) {
  const { showToast } = useToast();
  const [options, setOptions] = useState<CropOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchCrops({ page, pageSize });
      const list = response.items?.map((item: any) => ({
        id: item.id,
        description: item.description,
      })) ?? [];
      setOptions(list);
    } catch (error: any) {
      setOptions([]);
      showToast({
        title: 'Ops!',
        description: error?.response?.data?.message ?? 'Não foi possível carregar as culturas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  return { crops: options, isLoading, reload: load };
}
