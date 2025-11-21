import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AreaCard } from '../AreaCard';
import type { Plant } from '@/entities/plant';

describe('AreaCard', () => {
  const baseArea: Plant = {
    id: 1,
    areaSize: 2,
    soilCorrection: false,
    fertileIrrigation: true,
    seed: true,
    areaLocationName: 'Talhão 01',
    variety: 'Alface crespa',
    geo: null,
  } as Plant;

  it('renders area information', () => {
    render(<AreaCard area={baseArea} />);
    expect(screen.getByText('Talhão 01')).toBeInTheDocument();
    expect(screen.getByText(/Alface crespa/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '30');
  });

  it('calls onOpenArea when clicking actions', async () => {
    const user = userEvent.setup();
    const handleOpen = vi.fn();
    render(<AreaCard area={baseArea} onOpenArea={handleOpen} />);
    await user.click(screen.getByRole('button', { name: /detalhes/i }));
    expect(handleOpen).toHaveBeenCalledWith('1');
  });
});
