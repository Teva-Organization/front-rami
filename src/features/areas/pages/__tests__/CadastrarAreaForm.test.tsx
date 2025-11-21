import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AreaCreateForm, { AreaFormValues } from '../CadastrarAreaForm';

const mockUseCropsOptions = vi.fn();
vi.mock('../../crops/hooks/useCropsOptions', () => ({
  useCropsOptions: () => mockUseCropsOptions(),
}));

describe('CadastrarAreaForm', () => {
  beforeEach(() => {
    mockUseCropsOptions.mockReturnValue({
      crops: [{ id: 1, description: 'Alface Americana' }],
      isLoading: false,
      reload: vi.fn(),
    });
  });

  it('exibe mensagens de erro ao enviar sem preencher campos obrigatórios', async () => {
    render(<AreaCreateForm onComplete={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(await screen.findByText('Informe o nome da área')).toBeInTheDocument();
    expect(screen.getByText('Informe o tamanho da área')).toBeInTheDocument();
    expect(screen.getByText('Selecione uma cultura')).toBeInTheDocument();
    expect(screen.getByText('Selecione uma variedade')).toBeInTheDocument();
  });

  it('envia o formulário com dados válidos', async () => {
    const handleComplete = vi.fn();
    render(<AreaCreateForm onComplete={handleComplete} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Nome da área'), 'Talhão Norte');
    const areaSizeInput = screen.getByLabelText('Tamanho da área', { selector: 'input' });
    await user.clear(areaSizeInput);
    await user.type(areaSizeInput, '2.5');
    await user.click(screen.getByLabelText('Cultura'));
    await user.click(screen.getByText('Alface Americana'));
    await user.click(screen.getByLabelText('Variedade'));
    await user.click(screen.getByText('Americana'));
    await user.type(screen.getByLabelText('Marca da semente'), 'Isla');
    await user.type(screen.getByLabelText('Substrato'), 'Substrato Teste');

    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(handleComplete).toHaveBeenCalledWith(
        expect.objectContaining<AreaFormValues>({
          areaName: 'Talhão Norte',
          areaSize: 2.5,
          areaUnit: 'ha',
          cropId: '1',
          culture: 'Alface Americana',
          formType: 'semente',
          seedBrand: 'Isla',
          substrate: 'Substrato Teste',
          variety: 'Americana',
          tray: '128 células',
        }),
      );
    });
  });
});
