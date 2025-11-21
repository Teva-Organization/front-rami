import React from 'react';
import type { Plant } from '@/entities/plant';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FertIcon, NoteIcon, PlantIcon, WaterIcon } from './area-icons';

type AreaCardProps = {
  area: Plant;
  onOpenArea?: (id: string) => void;
  className?: string;
};

const chipBase = 'flex items-center justify-center gap-1.5 rounded-2xl bg-muted px-3 py-1.5 text-xs text-muted-foreground';

export function AreaCard({ area, onOpenArea, className }: AreaCardProps) {
  const cultura = area.variety ?? area.seedType ?? 'Sem cultura';
  const status = area.status ?? (area.seed ? 'Plantio' : 'Transplante');
  const progresso = area.seed ? 30 : 60;
  const irrigationLabel = area.fertileIrrigation ? 'Irrigação' : 'Sem irrigação';

  return (
    <article className={cn('group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg', className)}>
      <div className="relative aspect-[16/9] bg-gradient-to-br from-emerald-800 to-emerald-600">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500937386664-56adf86244b5?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" aria-hidden="true" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white drop-shadow-sm">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-emerald-700 shadow">
            <PlantIcon />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight">{area.areaLocationName}</h3>
            <p className="text-xs text-emerald-50/90">
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
        <div className="h-2 rounded-full bg-stone-100" role="progressbar" aria-valuenow={progresso} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${progresso}%` }} />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium text-stone-600">
          <span className={chipBase}>
            <WaterIcon small />
            <span>{irrigationLabel}</span>
          </span>
          <span className={chipBase}>
            <FertIcon small />
            <span>Adubação</span>
          </span>
          <span className={chipBase}>
            <NoteIcon small />
            <span>Tarefas</span>
          </span>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenArea?.(String(area.id))} aria-label={`Ver detalhes da área ${area.areaLocationName}`}>
            Detalhes
          </Button>
          <Button onClick={() => onOpenArea?.(String(area.id))} aria-label={`Abrir área ${area.areaLocationName}`}>
            Abrir
          </Button>
        </div>
      </div>
    </article>
  );
}
