import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import type { Plant } from '../../../entities/plant';
import { getPlantById } from '../api/plant.client';
import { useWeather } from '../../../shared/hooks/useWeather';
import { useToast } from '@/shared/ui/ToastProvider';

function cultureCycleDays(cultura?: string | null): number {
  if (!cultura) return 60;
  const key = cultura.toLowerCase();
  if (key.includes('rúcula') || key.includes('rucula')) return 40;
  if (key.includes('alface')) return 60;
  if (key.includes('cebolinha')) return 90;
  if (key.includes('tomate')) return 120;
  if (key.includes('coentro')) return 45;
  if (key.includes('couve')) return 90;
  return 60;
}

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function computeStage(area: Plant) {
  const start = area.createdAt ? new Date(area.createdAt) : new Date();
  const now = new Date();
  const cycleDays = cultureCycleDays(area.variety ?? area.seedType);
  const d = daysBetween(start, now);
  const pct = Math.max(0, Math.min(100, Math.round((d / cycleDays) * 100)));

  let stage = 'Crescimento';
  if (d <= 7) stage = 'Emergência';
  else if (d <= 21) stage = 'Crescimento inicial';
  else if (d >= cycleDays - 7 && d < cycleDays) stage = 'Pré-colheita';
  else if (d >= cycleDays) stage = 'Colheita';

  const estHarvest = new Date(start);
  estHarvest.setDate(estHarvest.getDate() + cycleDays);

  return { stage, pct, cycleDays, days: d, estHarvest };
}

export default function AreaCover({ areaId, onBack }: { areaId: string; onBack?: () => void }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [area, setArea] = useState<Plant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const numericId = Number(areaId);
      if (!user || Number.isNaN(numericId)) {
        setArea(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await getPlantById(numericId);
        if (isMounted) {
          setArea(data);
        }
      } catch (error: any) {
        const message =
          error?.response?.data?.message ?? 'Não foi possível carregar esta área.';
        if (isMounted) {
          setArea(null);
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
  }, [areaId, user, showToast]);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function resolve() {
      if (area?.geo?.lat && area.geo.lng) {
        setCoords({ lat: area.geo.lat, lng: area.geo.lng });
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!cancelled) {
              setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            }
          },
          () => {
            if (!cancelled) setCoords({ lat: -23.55, lng: -46.63 });
          },
          { enableHighAccuracy: false, timeout: 4000 },
        );
      } else {
        setCoords({ lat: -23.55, lng: -46.63 });
      }
    }
    resolve();
    return () => {
      cancelled = true;
    };
  }, [area?.geo]);

  const weather = useWeather(coords);
  const weatherDaily = weather.data?.daily ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="mx-auto max-w-md p-4 text-center text-sm text-stone-500">
          Carregando área...
        </div>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="min-h-screen bg-stone-50">
        <header className="sticky top-0 z-30 w-full border-b border-neutral-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-md items-center gap-2 px-4">
            <button
              onClick={onBack}
              className="-ml-2 rounded-xl p-2 text-neutral-700 hover:bg-neutral-100"
              aria-label="Voltar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <span className="text-sm text-neutral-600">Área não encontrada</span>
          </div>
        </header>
        <div className="mx-auto max-w-md p-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 text-neutral-700">
            Não encontramos dados desta área.
          </div>
        </div>
      </div>
    );
  }

  const { stage, pct, cycleDays, days, estHarvest } = computeStage(area);

  type Suggest = { title: string; desc?: string };
  const suggestions: Suggest[] = useMemo(() => {
    const arr: Suggest[] = [];
    if (stage === 'Emergência') {
      arr.push({ title: 'Acompanhar emergência', desc: 'Manter substrato úmido, sem encharcar.' });
    }
    if (stage === 'Crescimento inicial') {
      arr.push({ title: 'Iniciar adubo de cobertura', desc: 'Dose leve de N e K para estimular vigor.' });
      arr.push({ title: 'Capina leve', desc: 'Retirar plantas daninhas ao redor do canteiro.' });
    }
    if (stage === 'Pré-colheita') {
      arr.push({ title: 'Organizar colheita', desc: 'Planejar embalagens, transporte e escoamento.' });
    }
    if (stage === 'Colheita') {
      arr.push({ title: 'Realizar colheita', desc: 'Escolher horário mais fresco para maior qualidade.' });
    }
    return arr;
  }, [stage]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-900"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Voltar
        </button>

        <section className="grid gap-4 rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500">Área</p>
            <h1 className="text-2xl font-semibold text-stone-900">
              {area.areaLocationName}
            </h1>
            <p className="text-sm text-stone-500">
              {area.variety ?? area.seedType ?? 'Sem cultura definida'} • {area.areaSize ?? 0} ha
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <p className="font-semibold">Próximos passos</p>
            <p>
              Estágio atual: <span className="font-semibold">{stage}</span>
            </p>
            <p>Previsão de colheita: {estHarvest.toLocaleDateString()}</p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-stone-500">Progresso</p>
                <p className="text-2xl font-semibold text-stone-900">{pct}%</p>
              </div>
              <span className="text-sm text-stone-500">
                Dias em campo: <strong>{days}</strong> / {cycleDays}
              </span>
            </div>
            <div className="mt-4 h-3 rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-stone-700">Condições climáticas</p>
            <div className="mt-3 space-y-2 text-sm text-stone-600">
              {weatherDaily.slice(0, 3).map((day, idx) => (
                <div
                  key={`${day.datetime}-${idx}`}
                  className="flex items-center justify-between rounded-2xl border border-stone-100 px-3 py-2"
                >
                  <span>{new Date(day.datetime).toLocaleDateString()}</span>
                  <span>
                    {Math.round(day.tempmin)}° / {Math.round(day.tempmax)}°
                  </span>
                </div>
              ))}
              {!weatherDaily.length ? (
                <p className="text-xs text-stone-400">
                  Sem dados climáticos para esta localização.
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-stone-700">Sugestões de manejo</p>
          <div className="mt-3 space-y-3">
            {suggestions.map((suggestion, idx) => (
              <div
                key={`${suggestion.title}-${idx}`}
                className="rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3 text-sm text-stone-700"
              >
                <p className="font-semibold text-stone-900">{suggestion.title}</p>
                {suggestion.desc ? (
                  <p className="text-xs text-stone-500">{suggestion.desc}</p>
                ) : null}
              </div>
            ))}
            {!suggestions.length ? (
              <p className="text-xs text-stone-500">
                Nenhuma sugestão disponível para o estágio atual.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
