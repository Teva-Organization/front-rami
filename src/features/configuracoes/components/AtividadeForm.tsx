import React from 'react';
import type { WFActivity } from '@/entities/workflow';
import type { WFActivityPayload } from '../api/wf-activities.client';

type AtividadeFormProps = {
  mode: 'create' | 'edit';
  initialData?: WFActivity | null;
  onSubmit: (values: WFActivityPayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
};

export function AtividadeForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: AtividadeFormProps) {
  const [description, setDescription] = React.useState(
    initialData?.description ?? '',
  );
  const [deadline, setDeadline] = React.useState(
    initialData?.deadline != null ? String(initialData.deadline) : '',
  );
  const [errors, setErrors] = React.useState<{ description?: string; deadline?: string }>({});

  React.useEffect(() => {
    setDescription(initialData?.description ?? '');
    setDeadline(initialData?.deadline != null ? String(initialData.deadline) : '');
  }, [initialData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!description.trim()) {
      nextErrors.description = 'Informe uma descrição';
    }

    if (!deadline.trim()) {
      nextErrors.deadline = 'Informe o prazo em minutos';
    } else if (Number.isNaN(Number(deadline)) || Number(deadline) < 0) {
      nextErrors.deadline = 'Informe um número válido';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await onSubmit({
      description: description.trim(),
      deadline: Number(deadline),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-stone-200 bg-white px-6 py-6 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          {mode === 'create' ? 'Nova atividade' : 'Editar atividade'}
        </p>
        <h2 className="text-xl font-semibold text-stone-900">
          {mode === 'create' ? 'Cadastrar atividade' : 'Atualizar atividade'}
        </h2>
        <p className="text-sm text-stone-500">
          Defina a descrição e o prazo em minutos.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex flex-col gap-1 text-sm text-stone-600">
          Descrição
          <input
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="rounded-2xl border border-stone-200 px-4 py-2 text-sm text-stone-800 outline-none transition focus:border-emerald-500"
            placeholder="Ex.: Aprovação do gestor"
          />
          {errors.description ? (
            <span className="text-xs text-red-500">{errors.description}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1 text-sm text-stone-600">
          Prazo (minutos)
          <input
            type="number"
            min={0}
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            className="rounded-2xl border border-stone-200 px-4 py-2 text-sm text-stone-800 outline-none transition focus:border-emerald-500"
            placeholder="Ex.: 120"
          />
          {errors.deadline ? (
            <span className="text-xs text-red-500">{errors.deadline}</span>
          ) : null}
        </label>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
