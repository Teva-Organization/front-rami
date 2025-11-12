import { useEffect } from 'react';
import AreaCover from '../../features/areas/components/AreaCover';
import { useNavigate, useRouteParams } from '../router';

export default function AreaDetails() {
  const navigate = useNavigate();
  const { id } = useRouteParams<{ id?: string }>();

  useEffect(() => {
    if (!id) {
      navigate('/dashboard', { replace: true });
    }
  }, [id, navigate]);

  if (!id) return null;

  return <AreaCover areaId={id} onBack={() => navigate('/dashboard')} />;
}
