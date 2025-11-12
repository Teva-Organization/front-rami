import React from 'react';

type CrudHeaderProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
};

export function CrudHeader({
  title,
  description,
  actionLabel,
  onAction,
}: CrudHeaderProps) {
  return (
    <section className="rounded-3xl border border-emerald-100 bg-white px-6 py-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Configurações
          </p>
          <h1 className="text-2xl font-semibold text-stone-900">{title}</h1>
          <p className="text-sm text-stone-500">{description}</p>
        </div>
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[.99]"
        >
          {actionLabel}
        </button>
      </div>
    </section>
  );
}
