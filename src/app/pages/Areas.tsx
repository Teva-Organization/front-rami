import React from 'react';
import { useNavigate } from '../router';
import MinhasAreas from '../../features/areas/pages/MinhasAreas';

export default function Areas() {
  const navigate = useNavigate();

  return (
    <MinhasAreas
      onCreateArea={() => navigate('/areas/cadastrar')}
      onOpenArea={(id) => navigate(`/areas/${id}`)}
    />
  );
}
