import React, { useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCropsOptions } from '../../crops/hooks/useCropsOptions';

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
type AreaFormInputs = z.input<typeof formSchema>;

type Props = {
  onComplete?: (values: AreaFormValues) => Promise<void> | void;
  onExit?: () => void;
};

export default function AreaCreateForm({ onComplete, onExit }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AreaFormInputs, unknown, AreaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
    },
  });
  const { crops, isLoading: isLoadingCrops } = useCropsOptions();

  const filteredCultures = useMemo(() => crops, [crops]);
  const areaUnit = watch('areaUnit');
  const cropId = watch('cropId');
  const variety = watch('variety');
  const tray = watch('tray');

  const handleCultureChange = (value: string) => {
    const selected = filteredCultures.find((crop) => String(crop.id) === value);
    setValue('cropId', value, { shouldValidate: true });
    setValue('culture', selected?.description ?? '', { shouldValidate: true });
  };

  const handleSelectValue =
    (field: keyof AreaFormInputs) =>
    (value: string) => {
      setValue(field, value, { shouldValidate: true });
    };

  const handleFormTypeChange = (value: AreaFormInputs['formType']) => {
    setValue('formType', value, { shouldValidate: true });
    if (value === 'semente') {
      setValue('supplier', '');
    } else {
      setValue('seedBrand', '');
      setValue('substrate', '');
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    await onComplete?.(values);
  });

  const formType = watch('formType');
  const showSeedFields = formType === 'semente';
  const showSeedlingFields = formType === 'muda';

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <main className="mx-auto w-full px-4 py-10">
        <section className="mb-8 flex flex-col gap-3 rounded-3xl border border-emerald-100 bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase text-emerald-600">Cadastro de área</p>
            <h1 className="text-2xl font-semibold text-stone-900">Informações essenciais</h1>
            <p className="text-sm text-stone-500">Preencha os dados da sua área para acompanhar o manejo com mais precisão.</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="text-sm font-medium text-stone-500"
            onClick={onExit}
          >
            Cancelar
          </Button>
        </section>

        <form onSubmit={onSubmit} className="space-y-10">
          <FormSection
            title="Dados da área"
            description="Informe o tamanho, nome e cultura que será cultivada."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Nome da área" error={errors.areaName?.message} htmlFor="areaName">
                <Input
                  id="areaName"
                  placeholder="Ex.: Talhão Norte"
                  aria-invalid={Boolean(errors.areaName)}
                  className="rounded-2xl border-stone-200 text-sm"
                  {...register('areaName')}
                />
              </FormField>

              <FormField label="Tamanho da área" error={errors.areaSize?.message} htmlFor="areaSize">
                <div className="flex rounded-2xl border border-stone-200 focus-within:border-emerald-500">
                  <Input
                    id="areaSize"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Ex.: 2,5"
                    aria-invalid={Boolean(errors.areaSize)}
                    className="rounded-none border-none text-sm focus-visible:ring-0"
                    {...register('areaSize')}
                  />
                  <Select value={areaUnit} onValueChange={handleSelectValue('areaUnit')}>
                    <SelectTrigger
                      id="areaUnit"
                      aria-label="Unidade de medida"
                      className="rounded-r-2xl border-l border-stone-200 bg-stone-50 px-3 py-3 text-sm text-stone-700"
                    >
                      <SelectValue placeholder="Unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ha">ha</SelectItem>
                      <SelectItem value="m2">m²</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FormField>

              <FormSelect
                label="Cultura"
                value={cropId}
                onChange={handleCultureChange}
                options={filteredCultures.map((crop) => ({ value: String(crop.id), label: crop.description }))}
                placeholder={isLoadingCrops ? 'Carregando...' : 'Selecione uma cultura'}
                helper={!isLoadingCrops && filteredCultures.length === 0 ? 'Nenhuma cultura encontrada. Cadastre novas culturas em Configurações > Culturas.' : undefined}
                error={errors.cropId?.message}
                disabled={isLoadingCrops}
              />

              <FormSelect
                label="Variedade"
                value={variety}
                onChange={handleSelectValue('variety')}
                options={VARIETY_OPTIONS.map((option) => ({ value: option, label: option }))}
                placeholder="Selecione"
                error={errors.variety?.message}
              />
            </div>
          </FormSection>

          <FormSection
            title="Produção"
            description="Defina a forma de plantio e os insumos utilizados."
                    aria-label="Variedade"
                    aria-invalid={Boolean(errors.variety)}
                  >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Forma de plantio" error={errors.formType?.message}>
                <div className="grid grid-cols-2 gap-3">
                  {(['semente', 'muda'] as const).map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={formType === option ? 'default' : 'outline'}
                      onClick={() => handleFormTypeChange(option)}
                      className={cn('rounded-2xl border text-sm capitalize', formType === option ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'text-stone-700')}
                    >
                      {option === 'semente' ? 'Semente' : 'Muda'}
                    </Button>
                  ))}
                </div>
              </FormField>

              <FormSelect
                label="Bandeja"
                value={tray}
                onChange={handleSelectValue('tray')}
                options={TRAY_OPTIONS.map((option) => ({ value: option, label: option }))}
                error={errors.tray?.message}
              />
            </div>

            {showSeedFields && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FormField label="Marca da semente" error={errors.seedBrand?.message} htmlFor="seedBrand">
                  <Input
                    id="seedBrand"
                    placeholder="Ex.: Isla, Feltrin..."
                    aria-invalid={Boolean(errors.seedBrand)}
                    className="rounded-2xl border-stone-200 text-sm"
                    {...register('seedBrand')}
                  />
                </FormField>
                <FormField label="Substrato" error={errors.substrate?.message} htmlFor="substrate">
                  <Input
                    id="substrate"
                    placeholder="Informe o substrato utilizado"
                    aria-invalid={Boolean(errors.substrate)}
                    className="rounded-2xl border-stone-200 text-sm"
                    {...register('substrate')}
                  />
                </FormField>
              </div>
            )}

            {showSeedlingFields && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FormField label="Fornecedor (opcional)" error={errors.supplier?.message} htmlFor="supplier">
                  <Input
                    id="supplier"
                    placeholder="Quem fornece as mudas?"
                    aria-invalid={Boolean(errors.supplier)}
                    className="rounded-2xl border-stone-200 text-sm"
                    {...register('supplier')}
                  />
                </FormField>
              </div>
            )}
          </FormSection>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" onClick={onExit} className="rounded-2xl border-stone-200">
              Voltar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-2xl bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-700">
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  error?: string;
  htmlFor?: string;
  helper?: string;
  children: React.ReactNode;
};

function FormField({ label, error, htmlFor, helper, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <label htmlFor={htmlFor} className="font-medium text-stone-700">
        {label}
      </label>
      {children}
      {error ? (
        <span className="text-xs text-red-500">{error}</span>
      ) : helper ? (
        <span className="text-xs text-stone-500">{helper}</span>
      ) : null}
    </div>
  );
}

type FormSelectProps = {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
};

function FormSelect({ label, value, onChange, options, placeholder, error, helper, disabled }: FormSelectProps) {
  return (
    <FormField label={label} error={error} helper={helper}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger aria-label={label} aria-invalid={Boolean(error)} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
          <SelectValue placeholder={placeholder ?? 'Selecione'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

type FormSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="rounded-3xl border border-white bg-white px-6 py-6 shadow-sm ring-1 ring-black/5">
      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      {description ? <p className="text-sm text-stone-500">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
