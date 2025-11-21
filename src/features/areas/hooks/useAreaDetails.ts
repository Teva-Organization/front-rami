import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Plant, WFInstanceActivity } from '@/entities/plant';
import type { WFActivity } from '@/entities/workflow';
import { getPlantById } from '../api/plant.client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToast } from '@/shared/ui/ToastProvider';
import { getAreaFromCache, setAreaCache } from '../model/area-cache';

export function useAreaDetails(areaId: string) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [area, setArea] = useState<Plant | null>(() => getAreaFromCache(areaId));
  const [isLoading, setIsLoading] = useState(true);
  const [currentInstanceActivity, setCurrentInstanceActivity] = useState<WFInstanceActivity | null>(null);
  const [currentActivity, setCurrentActivity] = useState<WFActivity | null>(null);
  const [nextActivities, setNextActivities] = useState<WFActivity[]>([]);

  const load = useCallback(async () => {
    if (!user || !areaId) {
      setArea(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getPlantById(Number(areaId));
      setArea(data);
      setAreaCache(data);
    } catch (error: any) {
      setArea(null);
      showToast({
        title: 'Ops!',
        description: error?.response?.data?.message ?? 'Não foi possível carregar esta área.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [areaId, showToast, user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (isLoading) return;
    const activities = area?.wfInstance?.instanceActivities ?? [];
    if (!activities.length) {
      setCurrentInstanceActivity(null);
      setCurrentActivity(null);
      setNextActivities([]);
      return;
    }
    const sorted = [...activities].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const activityInProgress = sorted.find((activity) => !activity.endDate) ?? sorted[0] ?? null;
    const sanitizedNextActivities = (area?.wfInstance?.nextActivities ?? []).filter(
      (activity): activity is WFActivity => Boolean(activity),
    );
    setCurrentInstanceActivity(activityInProgress);
    setCurrentActivity(activityInProgress?.wfCurrentActivity ?? null);
    setNextActivities(sanitizedNextActivities);
  }, [area, isLoading]);

  return { area, isLoading, currentInstanceActivity, currentActivity, nextActivities, reload: load };
}
