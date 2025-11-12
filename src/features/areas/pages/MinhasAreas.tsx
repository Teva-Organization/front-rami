import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { fetchPlants } from '../api/plant.client';
import type { Plant } from '../../../entities/plant';
import { FertIcon, NoteIcon, PlantIcon, PlusIcon, WaterIcon } from '../components/area-icons';
import { useToast } from '@/shared/ui/ToastProvider';

type MinhasAreasProps = {
  onOpenArea?: (id: string) => void;
  onCreateArea?: () => void;
};

export default function MinhasAreas({ onOpenArea, onCreateArea }: MinhasAreasProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [areas, setAreas] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!user) {
        setAreas([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await fetchPlants({ page: 1, pageSize: 50 });
        if (isMounted) {
          setAreas(Array.isArray(data) ? data : data?.items ?? []);
        }
      } catch (error: any) {
        const message =
          error?.response?.data?.message ?? 'Não foi possível carregar as áreas.';
        if (isMounted) {
          setAreas([]);
          showToast({
            title: 'Ops!',
            description: message,
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [user, showToast]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 space-y-6">
        <header className="flex flex-col gap-3 rounded-2xl border border-emerald-50 bg-white/90 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-emerald-600">Operações</p>
            <h1 className="text-2xl font-semibold text-stone-900">Minhas áreas</h1>
            <p className="text-sm text-stone-500">{areas.length === 0 ? 'Nenhuma área cadastrada ainda' : `${areas.length} ${areas.length === 1 ? 'área cadastrada' : 'áreas cadastradas'}`}</p>
          </div>
          {onCreateArea ? (
            <button
              type="button"
              onClick={onCreateArea}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 active:scale-[.99]"
            >
              <PlusIcon />
              <span>Cadastrar nova área</span>
            </button>
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
        <button
          type="button"
          onClick={onCreateArea}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
        >
          <PlusIcon />
          <span>Cadastrar nova área</span>
        </button>
      ) : null}
    </div>
  );
}

function AreaCard({ area, onOpenArea }: { area: Plant; onOpenArea?: (id: string) => void }) {
  const cultura = area.variety ?? area.seedType ?? 'Sem cultura';
  const status = area.status ?? (area.seed ? 'Plantio' : 'Transplante');
  const progresso = area.seed ? 30 : 60;
  const irrigacao = area.fertileIrrigation;

  return (
    <article className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[16/9] bg-gradient-to-br from-emerald-800 to-emerald-600">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500937386664-56adf86244b5?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-emerald-700 shadow">
            <PlantIcon />
          </div>
          <div className="text-white drop-shadow-sm">
            <h3 className="text-base font-semibold leading-tight">{area.areaLocationName}</h3>
            <p className="text-xs text-emerald-50/80">
              {cultura} • {area.areaSize ?? 0} ha
            </p>
          </div>
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 shadow">
          {status}
        </span>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between text-sm">
          <p className="text-stone-500">Progresso</p>
          <span className="font-semibold text-stone-900">{progresso}%</span>
        </div>
        <div className="h-2 rounded-full bg-stone-100">
          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${progresso}%` }} />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium text-stone-600">
          <Chip icon={<WaterIcon small />} label={irrigacao ? 'Irrigação' : 'Sem irrigação'} />
          <Chip icon={<FertIcon small />} label="Adubação" />
          <Chip icon={<NoteIcon small />} label="Tarefas" />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenArea?.(String(area.id))}
            className="rounded-2xl border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
          >
            Detalhes
          </button>
          <button
            type="button"
            onClick={() => onOpenArea?.(String(area.id))}
            className="rounded-2xl bg-stone-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Abrir
          </button>
        </div>
      </div>
    </article>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 rounded-2xl bg-stone-100 px-3 py-1.5 text-xs text-stone-700">
      {icon}
      <span>{label}</span>
    </div>
  );
}
