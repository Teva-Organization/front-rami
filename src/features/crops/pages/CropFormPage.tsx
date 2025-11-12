import React from 'react';
import { useNavigate, useRouteParams } from '@/app/router';
import { useToast } from '@/shared/ui/ToastProvider';
import { z } from 'zod';
import { createCrop, getCropById, updateCrop } from '../api/crop.client';
import { fetchWFFlows } from '@/features/configuracoes/api/wf-flows.client';

type RouteParams = {
  cropId?: string;
};

const cropSchema = z.object({
  description: z.string().trim().min(1, 'Informe a descrição da cultura'),
  flowId: z.string().min(1, 'Selecione um fluxo'),
});

type CropFormValues = {
  description: string;
  flowId: string;
};

const INITIAL_VALUES: CropFormValues = {
  description: '',
  flowId: '',
};

export default function CropFormPage() {
  const navigate = useNavigate();
  const params = useRouteParams<RouteParams>();
  const cropId = params.cropId ? Number(params.cropId) : null;
  const isEditing = Number.isFinite(cropId);
  const { showToast } = useToast();

  const [formValues, setFormValues] = React.useState<CropFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [flows, setFlows] = React.useState<{ value: number; label: string }[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [flowsResponse, cropResponse] = await Promise.all([
          fetchWFFlows({ page: 1, pageSize: 200 }),
          isEditing && cropId ? getCropById(cropId) : Promise.resolve(null),
        ]);
        if (!mounted) return;
        setFlows(
          flowsResponse.items.map((flow: any) => ({
            value: flow.id,
            label: flow.description,
          })),
        );
        if (cropResponse) {
          setFormValues({
            description: cropResponse.description,
            flowId: String(cropResponse.flowId),
          });
        }
      } catch (error: any) {
        const message =
          error?.response?.data?.message ?? 'Não foi possível carregar os dados.';
        showToast({ title: 'Ops!', description: message, variant: 'destructive' });
        navigate('/configuracoes/culturas');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [isEditing, cropId, navigate, showToast]);

  const handleChange =
    (field: keyof CropFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormValues((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setErrors({});
    const result = cropSchema.safeParse(formValues);
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path) {
          nextErrors[path as string] = issue.message;
        }
      });
      setErrors(nextErrors);
      setIsSaving(false);
      return;
    }

    const payload = {
      description: result.data.description,
      flowId: Number(result.data.flowId),
    };

    try {
      if (isEditing && cropId) {
        await updateCrop(cropId, payload);
        showToast({ title: 'Cultura atualizada com sucesso!' });
      } else {
        await createCrop(payload);
        showToast({ title: 'Cultura criada com sucesso!' });
      }
      navigate('/configuracoes/culturas');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? 'Não foi possível salvar a cultura.';
      showToast({ title: 'Ops!', description: message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-stone-500">
        Carregando...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button
        type="button"
        onClick={() => navigate('/configuracoes/culturas')}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-900"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18L9 12 15 6" />
        </svg>
        Voltar
      </button>

      <section className="rounded-3xl border border-stone-200 bg-white px-6 py-6 shadow-sm">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            {isEditing ? 'Editar cultura' : 'Nova cultura'}
          </p>
          <h1 className="text-2xl font-semibold text-stone-900">
            {isEditing ? 'Atualizar cultura' : 'Cadastrar cultura'}
          </h1>
          <p className="text-sm text-stone-500">Informe a descrição e associe ao fluxo correspondente.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
            Descrição
            <input
              type="text"
              value={formValues.description}
              onChange={handleChange('description')}
              className={`rounded-2xl border px-4 py-2 text-sm text-stone-900 outline-none transition ${
                errors.description ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-emerald-500'
              }`}
              placeholder="Ex.: Tomate"
            />
            {errors.description ? (
              <span className="text-xs text-red-500">{errors.description}</span>
            ) : null}
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
            Fluxo associado
            <select
              value={formValues.flowId}
              onChange={handleChange('flowId')}
              className={`rounded-2xl border px-4 py-2 text-sm text-stone-900 outline-none transition ${
                errors.flowId ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-emerald-500'
              }`}
            >
              <option value="">Selecione...</option>
              {flows.map((flow) => (
                <option key={flow.value} value={flow.value}>
                  {flow.label}
                </option>
              ))}
            </select>
            {errors.flowId ? <span className="text-xs text-red-500">{errors.flowId}</span> : null}
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/configuracoes/culturas')}
              className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
