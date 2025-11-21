import { useMemo, useState, useCallback } from 'react';
import type { WFActivity } from '@/entities/workflow';
import { useToast } from '@/shared/ui/ToastProvider';

export function useNextActivities(nextActivities: WFActivity[] = []) {
  const { showToast } = useToast();
  const [selectedNextActivity, setSelectedNextActivity] = useState('');

  const sanitized = useMemo(() => (nextActivities ?? []).filter((activity): activity is WFActivity => Boolean(activity)), [nextActivities]);

  const options = useMemo(
    () =>
      sanitized.map((activity, index) => ({
        value: String(activity.id ?? index),
        label: activity.description ?? `Atividade #${activity.id ?? index + 1}`,
      })),
    [sanitized],
  );

  const hasNextActivities = sanitized.length > 0;
  const hasMultipleNextActivities = sanitized.length > 1;
  const singleNextActivity = !hasMultipleNextActivities ? sanitized[0] ?? null : null;
  const singleNextActivityLabel = singleNextActivity?.description ?? (singleNextActivity ? `Atividade #${singleNextActivity.id}` : '');

  const advanceTargetValue = hasMultipleNextActivities
    ? selectedNextActivity
    : singleNextActivity
    ? String(singleNextActivity.id)
    : '';
  const showAdvanceButton = Boolean(advanceTargetValue);
  const selectedNextActivityLabel = options.find((option) => option.value === selectedNextActivity)?.label ?? '';

  const handleAdvance = useCallback(() => {
    if (!advanceTargetValue) return;
    const label = hasMultipleNextActivities ? selectedNextActivityLabel : singleNextActivityLabel;
    showToast({
      title: 'Avançar para próxima atividade',
      description: label ? `Atividade selecionada: ${label}` : 'Atividade registrada.',
    });
  }, [advanceTargetValue, hasMultipleNextActivities, selectedNextActivityLabel, showToast, singleNextActivityLabel]);

  return {
    sanitized,
    options,
    selectedNextActivity,
    setSelectedNextActivity,
    selectedNextActivityLabel,
    hasNextActivities,
    hasMultipleNextActivities,
    singleNextActivity,
    singleNextActivityLabel,
    advanceTargetValue,
    showAdvanceButton,
    handleAdvance,
  };
}
