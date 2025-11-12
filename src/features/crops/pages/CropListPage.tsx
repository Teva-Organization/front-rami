import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from '@/app/router';
import { CrudHeader } from '@/features/configuracoes/components/CrudHeader';
import { DataTable, type TableColumn } from '@/features/configuracoes/components/DataTable';
import { PaginationControls } from '@/features/configuracoes/components/PaginationControls';
import { fetchCrops, deleteCrop } from '../api/crop.client';
import type { Crop } from '@/entities/crop';
import { useToast } from '@/shared/ui/ToastProvider';

export default function CropListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [records, setRecords] = React.useState<Crop[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [totalCount, setTotalCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchCrops({ page, pageSize });
      setRecords(data.items);
      setTotalCount(data.totalCount);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? 'Não foi possível carregar as culturas.';
      showToast({ title: 'Ops!', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, showToast]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (crop: Crop) => {
    const confirm = window.confirm(`Remover a cultura "${crop.description}"?`);
    if (!confirm) return;
    try {
      await deleteCrop(crop.id);
      showToast({ title: 'Cultura removida com sucesso!' });
      await load();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? 'Não foi possível remover a cultura.';
      showToast({ title: 'Ops!', description: message, variant: 'destructive' });
    }
  };

  const columns = React.useMemo<TableColumn<Crop>[]>(() => {
    return [
      { key: 'description', label: 'Descrição' },
      {
        key: 'flow.description',
        label: 'Fluxo',
        render: (item) => `${item.flow!.description}`,
      },
      {
        key: 'actions',
        label: 'Ações',
        render: (item) => (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(`/configuracoes/culturas/${item.id}/editar`)}
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
          </div>
        ),
      },
    ];
  }, [navigate]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <CrudHeader
        title="Culturas"
        description="Gerencie as culturas utilizadas nos plantios."
        actionLabel="Cadastrar cultura"
        onAction={() => navigate('/configuracoes/culturas/novo')}
      />

      <div className="rounded-3xl border border-stone-200 bg-white/70 p-4 shadow-sm">
        <DataTable
          data={records}
          columns={columns}
          rowKey={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="Nenhuma cultura cadastrada ainda."
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
      </div>
    </div>
  );
}
