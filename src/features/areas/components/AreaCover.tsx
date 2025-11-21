import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Plant, WFInstanceActivity } from "../../../entities/plant";
import type { WFActivity } from "@/entities/workflow";
import { useWeather } from "../../../shared/hooks/useWeather";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNextActivities } from "../hooks/useNextActivities";

function cultureCycleDays(cultura?: string | null): number {
  if (!cultura) return 60;
  const key = cultura.toLowerCase();
  if (key.includes("rúcula") || key.includes("rucula")) return 40;
  if (key.includes("alface")) return 60;
  if (key.includes("cebolinha")) return 90;
  if (key.includes("tomate")) return 120;
  if (key.includes("coentro")) return 45;
  if (key.includes("couve")) return 90;
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

  let stage = "Crescimento";
  if (d <= 7) stage = "Emergência";
  else if (d <= 21) stage = "Crescimento inicial";
  else if (d >= cycleDays - 7 && d < cycleDays) stage = "Pré-colheita";
  else if (d >= cycleDays) stage = "Colheita";

  const estHarvest = new Date(start);
  estHarvest.setDate(estHarvest.getDate() + cycleDays);

  return { stage, pct, cycleDays, days: d, estHarvest };
}

function formatDateTime(value?: string | null) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return null;
  }
}

type AreaCoverProps = {
  area: Plant | null;
  isLoading?: boolean;
  onBack?: () => void;
  currentInstanceActivity?: WFInstanceActivity | null;
  currentActivity?: WFActivity | null;
  nextActivities?: WFActivity[];
};

export default function AreaCover({
  area,
  isLoading = false,
  onBack,
  currentInstanceActivity,
  currentActivity,
  nextActivities = [],
}: AreaCoverProps) {
  const {
    options,
    selectedNextActivity,
    setSelectedNextActivity,
    selectedNextActivityLabel,
    hasNextActivities,
    hasMultipleNextActivities,
    singleNextActivityLabel,
    showAdvanceButton,
    handleAdvance,
  } = useNextActivities(nextActivities);
  const stageInfo = useMemo(() => (area ? computeStage(area) : null), [area]);
  type Suggest = { title: string; desc?: string };

  const suggestions = useMemo(() => {
    if (!stageInfo) return [];
    const arr: Suggest[] = [];
    const stage = stageInfo.stage;
    if (stage === "Emergência") {
      arr.push({
        title: "Acompanhar emergência",
        desc: "Manter substrato úmido, sem encharcar.",
      });
    }
    if (stage === "Crescimento inicial") {
      arr.push({
        title: "Iniciar adubo de cobertura",
        desc: "Dose leve de N e K para estimular vigor.",
      });
      arr.push({
        title: "Capina leve",
        desc: "Retirar plantas daninhas ao redor do canteiro.",
      });
    }
    if (stage === "Pré-colheita") {
      arr.push({
        title: "Organizar colheita",
        desc: "Planejar embalagens, transporte e escoamento.",
      });
    }
    if (stage === "Colheita") {
      arr.push({
        title: "Realizar colheita",
        desc: "Escolher horário mais fresco para maior qualidade.",
      });
    }
    return arr;
  }, [stageInfo]);

  const currentActivityId = currentInstanceActivity?.wfCurrentActivityId;

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  useEffect(() => {
    let cancelled = false;
    async function resolve() {
      if (area?.geo?.lat && area.geo.lng) {
        setCoords({ lat: area.geo.lat, lng: area.geo.lng });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!cancelled) {
              setCoords({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              });
            }
          },
          () => {
            if (!cancelled) setCoords({ lat: -23.55, lng: -46.63 });
          },
          { enableHighAccuracy: false, timeout: 4000 }
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
  const nextActivitySelectId = `next-activity-select-${area?.id ?? "area"}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="mx-auto w-full p-4 text-center text-sm text-stone-500">
          Carregando área...
        </div>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="min-h-screen bg-stone-50">
        <header className="sticky top-0 z-30 w-full border-b border-neutral-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-14 w-full items-center gap-2 px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              aria-label="Voltar"
              className="-ml-2 text-neutral-700"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Button>
            <span className="text-sm text-neutral-600">
              Área não encontrada
            </span>
          </div>
        </header>
        <div className="mx-auto w-full p-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 text-neutral-700">
            Não encontramos dados desta área.
          </div>
        </div>
      </div>
    );
  }

  const { stage, pct, cycleDays, days, estHarvest } = stageInfo!;
  const currentActivityStartedAt = formatDateTime(
    currentInstanceActivity?.createdAt
  );
  const currentActivityFinishedAt = formatDateTime(
    currentInstanceActivity?.endDate
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto w-full px-4 py-6">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="mb-4 w-fit gap-2 text-sm font-semibold text-stone-600 hover:text-stone-900"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Voltar
        </Button>

        <DetailCard>
          <p className="text-xs uppercase tracking-wide text-stone-500">Área</p>
          <h1 className="text-2xl font-semibold text-stone-900">
            {area.areaLocationName}
          </h1>
          <p className="text-sm text-stone-500">
            {area.variety ?? area.seedType ?? "Sem cultura definida"} •{" "}
            {area.areaSize ?? 0} ha
          </p>
        </DetailCard>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <SurfaceCard>
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Informações da área
              </p>
              <div className="mt-3 space-y-2 text-sm text-stone-600">
                <p>
                  Cultura:{" "}
                  <span className="font-semibold text-stone-900">
                    {area.crop?.description ??
                      area.variety ??
                      area.seedType ??
                      "Não informada"}
                  </span>
                </p>
                <p>
                  Tamanho:{" "}
                  <span className="font-semibold text-stone-900">
                    {area.areaSize ?? 0} ha
                  </span>
                </p>
                <p>Status: {area.status ?? "Sem status"}</p>
                {area.createdAt ? (
                  <p>
                    Criada em:{" "}
                    <span>{new Date(area.createdAt).toLocaleDateString()}</span>
                  </p>
                ) : null}
              </div>
            </SurfaceCard>
          </div>

          <section className="flex flex-col gap-4">
            <SurfaceCard>
              <AreaActivitiesPanel
                instanceActivitiesCount={
                  area.wfInstance?.instanceActivities?.length ?? 0
                }
                currentActivityId={currentActivityId}
                currentActivityDescription={currentActivity?.description}
                currentActivityStartedAt={currentActivityStartedAt}
                currentActivityFinishedAt={currentActivityFinishedAt}
                hasNextActivities={hasNextActivities}
                hasMultipleNextActivities={hasMultipleNextActivities}
                nextActivityOptions={options}
                nextActivitySelectId={nextActivitySelectId}
                selectedNextActivity={selectedNextActivity}
                selectedNextActivityLabel={selectedNextActivityLabel}
                singleNextActivityLabel={singleNextActivityLabel}
                showAdvanceButton={showAdvanceButton}
                onSelectNextActivity={setSelectedNextActivity}
                onAdvance={handleAdvance}
              />
            </SurfaceCard>
            <SurfaceCard>
              <p className="text-sm font-semibold text-stone-700">
                Condições climáticas
              </p>
              <div className="mt-3 space-y-2 text-sm text-stone-600">
                {weatherDaily.slice(0, 3).map((day, idx) => (
                  <div
                    key={`${day.datetime}-${idx}`}
                    className="flex items-center justify-between rounded-2xl border border-stone-100 px-3 py-2"
                  >
                    <span>{new Date(day.datetime).toLocaleDateString()}</span>
                    <span>
                      {day.tempmin != null ? Math.round(day.tempmin) : "--"}° /{" "}
                      {day.tempmax != null ? Math.round(day.tempmax) : "--"}°
                    </span>
                  </div>
                ))}
                {!weatherDaily.length ? (
                  <p className="text-xs text-stone-400">
                    Sem dados climáticos para esta localização.
                  </p>
                ) : null}
              </div>
            </SurfaceCard>
          </section>
        </section>
      </div>
    </div>
  );
}

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

function DetailCard({ children, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm",
        className
      )}
    >
      {children}
    </section>
  );
}

function SurfaceCard({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-stone-200 bg-white p-5 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

type AreaActivitiesPanelProps = {
  instanceActivitiesCount: number;
  currentActivityId?: number;
  currentActivityDescription?: string | null;
  currentActivityStartedAt: string | null;
  currentActivityFinishedAt: string | null;
  hasNextActivities: boolean;
  hasMultipleNextActivities: boolean;
  nextActivityOptions: Array<{ value: string; label: string }>;
  nextActivitySelectId: string;
  selectedNextActivity: string;
  selectedNextActivityLabel: string;
  singleNextActivityLabel: string;
  showAdvanceButton: boolean;
  onSelectNextActivity: (value: string) => void;
  onAdvance: () => void;
};

function AreaActivitiesPanel({
  currentActivityDescription,
  currentActivityFinishedAt,
  currentActivityId,
  currentActivityStartedAt,
  hasMultipleNextActivities,
  hasNextActivities,
  instanceActivitiesCount,
  nextActivityOptions,
  nextActivitySelectId,
  selectedNextActivity,
  selectedNextActivityLabel,
  singleNextActivityLabel,
  showAdvanceButton,
  onSelectNextActivity,
  onAdvance,
}: AreaActivitiesPanelProps) {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <SurfaceCard className="rounded-2xl border-stone-100 bg-white/80 p-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-stone-500">
          <span>Atividade atual</span>
        </div>
        {currentActivityId ? (
          <div className="mt-3 space-y-1">
            <p className="text-lg font-semibold text-stone-900">
              {currentActivityDescription ?? `Atividade #${currentActivityId}`}
            </p>
            <p className="text-sm text-stone-500">
              Iniciada em: {currentActivityStartedAt ?? "Não informado"}
            </p>
            {currentActivityFinishedAt ? (
              <p className="text-sm text-stone-500">
                Finaliza em: {currentActivityFinishedAt}
              </p>
            ) : (
              <p className="text-sm text-emerald-700">
                Em andamento • {instanceActivitiesCount} etapas registradas
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-stone-500">
            Nenhuma atividade em andamento.
          </p>
        )}
      </SurfaceCard>
      <SurfaceCard className="rounded-2xl border-stone-100 bg-white/80 p-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-stone-500">
          <span>Próximas atividades</span>
          {hasNextActivities ? (
            <span className="text-[0.65rem] text-stone-400">
              {hasMultipleNextActivities
                ? `${nextActivityOptions.length} possibilidades`
                : "1 possibilidade"}
            </span>
          ) : null}
        </div>
        <div className="mt-3 space-y-3">
          {hasNextActivities ? (
            <>
              {hasMultipleNextActivities ? (
                <>
                  <label htmlFor={nextActivitySelectId} className="sr-only">
                    Próximas atividades
                  </label>
                  <select
                    id={nextActivitySelectId}
                    value={selectedNextActivity}
                    onChange={(event) =>
                      onSelectNextActivity(event.target.value)
                    }
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Selecione uma atividade</option>
                    {nextActivityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-stone-500">
                    {selectedNextActivityLabel
                      ? `Selecionada: ${selectedNextActivityLabel}`
                      : "Selecione para habilitar o avanço."}
                  </p>
                </>
              ) : (
                <div className="rounded-xl border border-stone-100 bg-stone-50 px-4 py-3 text-sm">
                  <p className="text-xs uppercase tracking-wide text-stone-500">
                    Próxima atividade
                  </p>
                  <p className="text-base font-semibold text-stone-900">
                    {singleNextActivityLabel}
                  </p>
                </div>
              )}
              {showAdvanceButton ? (
                <Button onClick={onAdvance} className="w-full rounded-xl">
                  Avançar para próxima atividade
                </Button>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-stone-500">
              Não há próximas atividades cadastradas para este estágio.
            </p>
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}
