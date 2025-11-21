import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { WFActivity } from '@/entities/workflow';
import { useToast } from '@/shared/ui/ToastProvider';
import { CrudHeader } from '../components/CrudHeader';
import { DataTable, type TableColumn } from '../components/DataTable';
import { PaginationControls } from '../components/PaginationControls';
import { AtividadeForm } from '../components/AtividadeForm';
import {
  createWFActivity,
  deleteWFActivity,
  fetchWFActivities,
  updateWFActivity,
  type WFActivityPayload,
} from '../api/wf-activities.client';

type FormState =
  | { mode: 'create'; record: null }
  | { mode: 'edit'; record: WFActivity };

function formatDate(value: string) {
  try {
    if(value) {
      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(value));
    }
    return '-';
  } catch {
    return value;
  }
}

export default function AtividadesPage() {
  const { showToast } = useToast();
  const [records, setRecords] = React.useState<WFActivity[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [totalCount, setTotalCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formState, setFormState] = React.useState<FormState | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const loadActivities = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchWFActivities({ page, pageSize });
      setRecords(response.items);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? 'Não foi possível carregar as atividades.';
      showToast({ title: 'Ops!', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, showToast]);

  React.useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleSubmit = async (payload: WFActivityPayload) => {
    setIsSubmitting(true);
    try {
      if (formState?.mode === 'edit' && formState.record) {
        await updateWFActivity(formState.record.id, payload);
        showToast({ title: 'Atividade atualizada com sucesso!' });
      } else {
        await createWFActivity(payload);
        showToast({ title: 'Atividade criada com sucesso!' });
      }
      setFormState(null);
      await loadActivities();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? 'Não foi possível salvar a atividade.';
      showToast({ title: 'Ops!', description: message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = React.useCallback(async (record: WFActivity) => {
    const confirm = window.confirm(
      `Deseja remover a atividade "${record.description}"?`,
    );
    if (!confirm) return;
    try {
      await deleteWFActivity(record.id);
      showToast({ title: 'Atividade removida com sucesso!' });
      await loadActivities();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? 'Não foi possível remover a atividade.';
      showToast({ title: 'Ops!', description: message, variant: 'destructive' });
    }
  }, [loadActivities, showToast]);

  const columns = React.useMemo<TableColumn<WFActivity>[]>(() => {
    return [
      { key: 'description', label: 'Descrição' },
      {
        key: 'deadline',
        label: 'Prazo (min)',
        render: (item) => (item.deadline ?? 0).toString(),
      },
      {
        key: 'createdAt',
        label: 'Criado em',
        render: (item) => formatDate(item.createdAt),
      },
      {
        key: 'updatedAt',
        label: 'Atualizado em',
        render: (item) => formatDate(item.updatedAt),
      },
    ];
  }, []);

  const actions = React.useMemo(() => {
    return {
      label: 'Ações',
      render: (item: WFActivity) => (
        <>
          <button
            type="button"
            onClick={() => setFormState({ mode: 'edit', record: item })}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:border-emerald-200"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => handleDelete(item)}
            className="inline-flex items-center gap-1 rounded-full border border-red-100 px-3 py-1 text-xs font-semibold text-red-600 transition hover:border-red-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Excluir
          </button>
        </>
      ),
    };
  }, [handleDelete]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <CrudHeader
        title="Atividades"
        description="Cadastre e mantenha as atividades utilizadas nos fluxos."
        actionLabel="Nova atividade"
        onAction={() => setFormState({ mode: 'create', record: null })}
      />

      <DataTable
        data={records}
        columns={columns}
        rowKey={(item) => item.id}
        isLoading={isLoading}
        actions={actions}
      />

      <PaginationControls
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={(nextPage) => {
          const totalPages = Math.max(
            1,
            Math.ceil((totalCount || 1) / pageSize),
          );
          const safePage = Math.min(Math.max(1, nextPage), totalPages);
          setPage(safePage);
        }}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      {formState ? (
        <AtividadeForm
          mode={formState.mode}
          initialData={formState.record ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setFormState(null)}
          isSubmitting={isSubmitting}
        />
      ) : null}
    </div>
  );
}
