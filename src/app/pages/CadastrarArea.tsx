import { useEffect } from 'react';
import { useNavigate } from '../router';
import { useAuth } from '../../features/auth/hooks/useAuth';
import CadastrarAreaForm, { type AreaFormValues } from '../../features/areas/pages/CadastrarAreaForm';
import { createPlant, type PlantPayload } from '../../features/areas/api/plant.client';
import { useToast } from '../../shared/ui/ToastProvider';

export default function CadastrarArea() {
  const navigate = useNavigate();
  const { user, isInitializing } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isInitializing && !user) {
      navigate('/signin', { replace: true });
    }
  }, [user, navigate, isInitializing]);

  if (isInitializing || !user) return null;

  return (
    <CadastrarAreaForm
      onExit={() => navigate('/areas')}
      onComplete={async (payload: AreaFormValues) => {
        const areaSizeHa =
          payload.areaUnit === 'ha'
            ? payload.areaSize
            : Number((payload.areaSize / 10000).toFixed(4));

        const plantPayload: PlantPayload = {
          areaSize: areaSizeHa,
          soilCorrection: false,
          irrigationDimension: undefined,
          fertileIrrigation: false,
          seed: payload.formType === 'semente',
          seedType: payload.formType === 'semente' ? payload.seedBrand : undefined,
          variety: payload.variety,
          seedlingSupplier: payload.formType === 'muda' ? payload.supplier : undefined,
          areaLocationName: payload.areaName,
          cropId: payload.cropId ? Number(payload.cropId) : undefined,
        };

        try {
          await createPlant(plantPayload);
          showToast({
            title: 'Área cadastrada com sucesso!',
            description: 'O backend confirmou o cadastro da área.',
          });
          navigate('/areas');
        } catch (error: any) {
          const message =
            error?.response?.data?.message ?? 'Não foi possível cadastrar a área.';
          showToast({
            title: 'Ops!',
            description: message,
            variant: 'destructive',
          });
          return;
        }
      }}
    />
  );
}
