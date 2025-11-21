import { useEffect } from 'react';
import AreaCover from '../../features/areas/components/AreaCover';
import { useNavigate, useRouteParams } from '../router';
import { useAreaDetails } from '@/features/areas/hooks/useAreaDetails';

export default function AreaDetails() {
  const navigate = useNavigate();
  const { id } = useRouteParams<{ id?: string }>();

  useEffect(() => {
    if (!id) {
      navigate('/dashboard', { replace: true });
    }
  }, [id, navigate]);

  if (!id) return null;

  const { area, isLoading, currentActivity, currentInstanceActivity, nextActivities } = useAreaDetails(id);

  return (
    <AreaCover
      area={area}
      isLoading={isLoading}
      currentActivity={currentActivity ?? null}
      currentInstanceActivity={currentInstanceActivity ?? null}
      nextActivities={nextActivities}
      onBack={() => navigate('/dashboard')}
    />
  );
}
