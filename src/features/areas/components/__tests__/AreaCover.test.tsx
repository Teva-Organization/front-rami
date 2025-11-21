import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import AreaCover from '../AreaCover';
import type { Plant, WFInstanceActivity } from '@/entities/plant';
import type { WFActivity } from '@/entities/workflow';

vi.mock('@/shared/ui/ToastProvider', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

const baseArea = {
  id: 1,
  areaSize: 2,
  soilCorrection: false,
  fertileIrrigation: true,
  seed: true,
  areaLocationName: 'Talhão de Teste',
  createdAt: new Date().toISOString(),
} as Plant;

const currentInstance: WFInstanceActivity = {
  id: 1,
  wfCurrentActivityId: 5,
  wfInstanceId: 1,
  createdAt: new Date().toISOString(),
  wfCurrentActivity: { id: 5, description: 'Plantio', createdAt: '', updatedAt: '' },
};

const nextActivities: WFActivity[] = [
  { id: 6, description: 'Irrigar', createdAt: '', updatedAt: '', deadline: null },
];

describe('AreaCover', () => {
  it('renderiza estado de loading', () => {
    render(<AreaCover area={null} isLoading />);
    expect(screen.getByText(/Carregando área/i)).toBeInTheDocument();
  });

  it('renderiza mensagem quando área não existe', () => {
    render(<AreaCover area={null} isLoading={false} />);
    expect(screen.getByText(/Área não encontrada/i)).toBeInTheDocument();
  });

  it('exibe dados da área e permite avançar atividade', async () => {
    const user = userEvent.setup();
    render(
      <AreaCover
        area={baseArea}
        currentInstanceActivity={currentInstance}
        currentActivity={currentInstance.wfCurrentActivity}
        nextActivities={nextActivities}
      />,
    );

    expect(screen.getByText('Talhão de Teste')).toBeInTheDocument();
    expect(screen.getByText(/Próximas atividades/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Avançar para próxima atividade/i }));
    expect(screen.getByText(/Próximas atividades/i)).toBeInTheDocument();
  });
});
