import React from 'react';
import { PlusIcon } from '../components/area-icons';
import { AreaCard } from '../components/AreaCard';
import { useAreasList } from '../hooks/useAreasList';
import { Button } from '@/components/ui/button';

type MinhasAreasProps = {
  onOpenArea?: (id: string) => void;
  onCreateArea?: () => void;
};

export default function MinhasAreas({ onOpenArea, onCreateArea }: MinhasAreasProps) {
  const { areas, isLoading } = useAreasList();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <main className="mx-auto w-full px-4 pb-24 pt-6 space-y-6">
        <header className="flex flex-col gap-3 rounded-2xl border border-emerald-50 bg-white/90 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-emerald-600">Operações</p>
            <h1 className="text-2xl font-semibold text-stone-900">Minhas áreas</h1>
            <p className="text-sm text-stone-500">{areas.length === 0 ? 'Nenhuma área cadastrada ainda' : `${areas.length} ${areas.length === 1 ? 'área cadastrada' : 'áreas cadastradas'}`}</p>
          </div>
          {onCreateArea ? (
            <Button onClick={onCreateArea} className="rounded-2xl">
              <PlusIcon />
              <span>Cadastrar nova área</span>
            </Button>
          ) : null}
        </header>

        {isLoading ? (
          <div className="rounded-2xl border border-stone-200 bg-white px-4 py-20 text-center text-sm text-stone-500 shadow-sm">
            Carregando áreas...
          </div>
        ) : areas.length === 0 ? (
          <EmptyState onCreateArea={onCreateArea} />
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {areas.map((area) => (
              <AreaCard key={area.id} area={area} onOpenArea={onOpenArea} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

function EmptyState({ onCreateArea }: { onCreateArea?: () => void }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <PlusIcon />
      </div>
      <h2 className="text-lg font-semibold text-stone-900">Comece cadastrando sua primeira área</h2>
      <p className="mt-1 text-sm text-stone-500">
        Registre a localização, cultura e acompanhe o progresso de cada talhão em um só lugar.
      </p>
      {onCreateArea ? (
        <Button variant="outline" onClick={onCreateArea} className="mt-5 rounded-2xl border-emerald-200">
          <PlusIcon />
          <span>Cadastrar nova área</span>
        </Button>
      ) : null}
    </div>
  );
}
