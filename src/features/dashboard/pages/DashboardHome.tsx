import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { fetchPlants } from '../../areas/api/plant.client';
import type { Plant } from '../../../entities/plant';
import { FertIcon, NoteIcon, PlantIcon, WaterIcon } from '../components/icons';
import { useToast } from '@/shared/ui/ToastProvider';

export default function DashboardHome() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Produtor';
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
        const data = await fetchPlants({ page: 1, pageSize: 20 });
        if (isMounted) {
          setAreas(Array.isArray(data) ? data : data?.items ?? []);
        }
      } catch (error: any) {
        const message =
          error?.response?.data?.message ?? 'Não foi possível carregar os plantios.';
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

  const irrigando = useMemo(() => areas.filter((area) => area.fertileIrrigation).length, [areas]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <main className="mx-auto max-w-6xl px-4 pb-32 pt-6">
        <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-stone-500">Bem-vindo de volta</p>
            <h1 className="text-xl font-semibold text-stone-800">{firstName} – Painel do Produtor</h1>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            titulo="Áreas"
            valor={isLoading ? '...' : String(areas.length)}
            detalhe={areas.length === 1 ? 'gerenciada' : 'gerenciadas'}
          />
          <KpiCard titulo="Tarefas" valor="0" detalhe="para hoje" />
          <KpiCard titulo="Irrigação" valor={String(irrigando)} detalhe="usando" />
          <KpiCard titulo="Safras" valor="0" detalhe="em andamento" destaque />
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-base font-semibold text-stone-700">Ações rápidas</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <QuickAction icon={<PlantIcon />} label="Novo plantio" />
            <QuickAction icon={<WaterIcon />} label="Reg. irrigação" />
            <QuickAction icon={<FertIcon />} label="Adubar" />
            <QuickAction icon={<NoteIcon />} label="Anotar tarefa" />
          </div>
        </section>
      </main>
    </div>
  );
}

function KpiCard({
  titulo,
  valor,
  detalhe,
  destaque,
}: {
  titulo: string;
  valor: string;
  detalhe?: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${destaque ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-stone-200 bg-white'}`}
    >
      <p className={`text-sm ${destaque ? 'text-emerald-50/90' : 'text-stone-500'}`}>{titulo}</p>
      <div className="mt-1 flex items-end gap-2">
        <span className={`text-2xl font-semibold leading-none ${destaque ? 'text-white' : 'text-stone-900'}`}>{valor}</span>
        {detalhe ? (
          <span className={`text-xs ${destaque ? 'text-emerald-50/90' : 'text-stone-500'}`}>{detalhe}</span>
        ) : null}
      </div>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 text-left shadow-sm transition hover:border-stone-300 hover:shadow"
    >
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">{icon}</div>
      <span className="text-sm font-medium text-stone-800">{label}</span>
    </button>
  );
}
