import React, { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { fetchCrops } from '../../crops/api/crop.client';
import { useToast } from '@/shared/ui/ToastProvider';

const CULTURE_OPTIONS = ['Alface', 'Tomate', 'Rúcula', 'Cebolinha', 'Couve', 'Coentro', 'Pimentão', 'Berinjela', 'Manjericão', 'Hortelã'];
const VARIETY_OPTIONS = ['Americana', 'Lisa', 'Roxa', 'Italiana', 'Cherry', 'Gaúcha', 'Japonesa'];
const TRAY_OPTIONS = ['128 células', '200 células', '288 células'] as const;

const formSchema = z
  .object({
    areaName: z.string().trim().min(1, 'Informe o nome da área'),
    areaSize: z
      .string()
      .trim()
      .min(1, 'Informe o tamanho da área')
      .transform((value) => Number(value))
      .pipe(z.number().positive('Informe um valor maior que zero')),
    areaUnit: z.enum(['ha', 'm2']),
    cropId: z.string().trim().min(1, 'Selecione uma cultura'),
    culture: z.string().trim().min(1, 'Selecione ou digite uma cultura'),
    formType: z.enum(['semente', 'muda']),
    seedBrand: z.string().trim().optional(),
    substrate: z.string().trim().optional(),
    supplier: z.string().trim().optional(),
    variety: z.string().trim().min(1, 'Selecione uma variedade'),
    tray: z.enum(TRAY_OPTIONS),
  })
  .superRefine((data, ctx) => {
    if (data.formType === 'semente') {
      if (!data.seedBrand) {
        ctx.addIssue({ path: ['seedBrand'], code: z.ZodIssueCode.custom, message: 'Informe a marca da semente' });
      }
      if (!data.substrate) {
        ctx.addIssue({ path: ['substrate'], code: z.ZodIssueCode.custom, message: 'Informe o substrato' });
      }
    }

    if (data.formType === 'muda' && data.supplier && data.supplier.length < 3) {
      ctx.addIssue({
        path: ['supplier'],
        code: z.ZodIssueCode.custom,
        message: 'Informe um fornecedor válido',
      });
    }
  });

export type AreaFormValues = z.infer<typeof formSchema>;

type FormState = {
  areaName: string;
  areaSize: string;
  areaUnit: 'ha' | 'm2';
  cropId: string;
  culture: string;
  formType: 'semente' | 'muda';
  seedBrand: string;
  substrate: string;
  supplier: string;
  variety: string;
  tray: (typeof TRAY_OPTIONS)[number];
};

type Props = {
  onComplete?: (values: AreaFormValues) => Promise<void> | void;
  onExit?: () => void;
};

export default function AreaCreateForm({ onComplete, onExit }: Props) {
  const { showToast } = useToast();
  const [formValues, setFormValues] = useState<FormState>({
    areaName: '',
    areaSize: '',
    areaUnit: 'ha',
    cropId: '',
    culture: '',
    formType: 'semente',
    seedBrand: '',
    substrate: '',
    supplier: '',
    variety: '',
    tray: '128 células',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [crops, setCrops] = useState<{ id: number; description: string }[]>([]);
  const [isLoadingCrops, setIsLoadingCrops] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoadingCrops(true);
      try {
        const response = await fetchCrops({ page: 1, pageSize: 200 });
        if (mounted) {
          const list = response.items?.map((item: any) => ({
            id: item.id,
            description: item.description,
          })) ?? [];
          setCrops(list);
        }
      } catch (error: any) {
        const message =
          error?.response?.data?.message ?? 'Não foi possível carregar as culturas.';
        showToast({ title: 'Ops!', description: message, variant: 'destructive' });
        if (mounted) {
          setCrops([]);
        }
      } finally {
        if (mounted) {
          setIsLoadingCrops(false);
        }
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [showToast]);

  const filteredCultures = useMemo(() => crops, [crops]);

  const handleChange =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleCultureChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { value } = event.target;
    const selected = filteredCultures.find((crop) => String(crop.id) === value);
    setFormValues((prev) => ({
      ...prev,
      cropId: value,
      culture: selected?.description ?? '',
    }));
  };

  const handleFormTypeChange = (value: FormState['formType']) => {
    setFormValues((prev) => ({
      ...prev,
      formType: value,
      ...(value === 'semente' ? { supplier: '' } : { seedBrand: '', substrate: '' }),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const result = formSchema.safeParse(formValues);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path) {
          formattedErrors[path as string] = issue.message;
        }
      });
      setErrors(formattedErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onComplete?.(result.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSeedFields = formValues.formType === 'semente';
  const showSeedlingFields = formValues.formType === 'muda';

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="mb-8 flex flex-col gap-3 rounded-3xl border border-emerald-100 bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase text-emerald-600">Cadastro de área</p>
            <h1 className="text-2xl font-semibold text-stone-900">Informações essenciais</h1>
            <p className="text-sm text-stone-500">Preencha os dados da sua área para acompanhar o manejo com mais precisão.</p>
          </div>
          <button
            type="button"
            className="text-sm font-medium text-stone-500 underline-offset-4 hover:underline"
            onClick={onExit}
          >
            Cancelar
          </button>
        </section>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="rounded-3xl border border-white bg-white px-6 py-6 shadow-sm ring-1 ring-black/5">
            <h2 className="text-lg font-semibold text-stone-900">Dados da área</h2>
            <p className="text-sm text-stone-500">Informe o tamanho, nome e cultura que será cultivada.</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Nome da área" error={errors.areaName}>
                <input
                  type="text"
                  value={formValues.areaName}
                  onChange={handleChange('areaName')}
                  placeholder="Ex.: Talhão Norte"
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </Field>

              <Field label="Tamanho da área" error={errors.areaSize}>
                <div className="flex rounded-2xl border border-stone-200 focus-within:border-emerald-500">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={formValues.areaSize}
                    onChange={handleChange('areaSize')}
                    placeholder="Ex.: 2,5"
                    className="flex-1 rounded-l-2xl bg-transparent px-4 py-3 text-sm outline-none"
                  />
                  <select
                    value={formValues.areaUnit}
                    onChange={handleChange('areaUnit')}
                    className="rounded-r-2xl border-l border-stone-200 bg-stone-50 px-3 py-3 text-sm text-stone-700 outline-none"
                  >
                    <option value="ha">ha</option>
                    <option value="m2">m²</option>
                  </select>
                </div>
              </Field>

              <Field label="Cultura" error={errors.cropId}>
                <select
                  value={formValues.cropId}
                  onChange={handleCultureChange}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm text-stone-800 outline-none transition ${
                    errors.cropId ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-emerald-500'
                  }`}
                >
                  <option value="">
                    {isLoadingCrops ? 'Carregando culturas...' : 'Selecione uma cultura'}
                  </option>
                  {filteredCultures.map((crop) => (
                    <option key={crop.id} value={String(crop.id)}>
                      {crop.description}
                    </option>
                  ))}
                </select>
                {!isLoadingCrops && filteredCultures.length === 0 ? (
                  <p className="mt-1 text-xs text-stone-500">
                    Nenhuma cultura encontrada. Cadastre novas culturas em Configurações &gt; Culturas.
                  </p>
                ) : null}
              </Field>

              <Field label="Variedade" error={errors.variety}>
                <select
                  value={formValues.variety}
                  onChange={handleChange('variety')}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-emerald-500"
                >
                  <option value="">Selecione</option>
                  {VARIETY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <div className="rounded-3xl border border-white bg-white px-6 py-6 shadow-sm ring-1 ring-black/5">
            <h2 className="text-lg font-semibold text-stone-900">Produção</h2>
            <p className="text-sm text-stone-500">Defina a forma de plantio e os insumos utilizados.</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Forma de plantio" error={errors.formType}>
                <div className="grid grid-cols-2 gap-3">
                  {(['semente', 'muda'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleFormTypeChange(option)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        formValues.formType === option
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-stone-200 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      {option === 'semente' ? 'Semente' : 'Muda'}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Bandeja" error={errors.tray}>
                <select
                  value={formValues.tray}
                  onChange={handleChange('tray')}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-emerald-500"
                >
                  {TRAY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {showSeedFields && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Marca da semente" error={errors.seedBrand}>
                  <input
                    type="text"
                    value={formValues.seedBrand}
                    onChange={handleChange('seedBrand')}
                    placeholder="Ex.: Isla, Feltrin..."
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                  />
                </Field>
                <Field label="Substrato" error={errors.substrate}>
                  <input
                    type="text"
                    value={formValues.substrate}
                    onChange={handleChange('substrate')}
                    placeholder="Informe o substrato utilizado"
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                  />
                </Field>
              </div>
            )}

            {showSeedlingFields && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Fornecedor (opcional)"
                  error={errors.supplier}
                >
                  <input
                    type="text"
                    value={formValues.supplier}
                    onChange={handleChange('supplier')}
                    placeholder="Quem fornece as mudas?"
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                  />
                </Field>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onExit}
              className="rounded-2xl border border-stone-200 px-6 py-3 text-sm font-medium text-stone-600 transition hover:border-stone-300"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-stone-700">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </label>
  );
}
