import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { WFFlow } from "@/entities/workflow";
import { useToast } from "@/shared/ui/ToastProvider";
import { CrudHeader } from "../components/CrudHeader";
import { DataTable, type TableColumn } from "../components/DataTable";
import { PaginationControls } from "../components/PaginationControls";
import { fetchWFFlows, deleteWFFlow } from "../api/wf-flows.client";
import { useNavigate } from "@/app/router";

function formatDate(value: string) {
  try {
    if (value) {
      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(value));
    }

    return '-'
  } catch {
    return value;
  }
}

export default function FluxosPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [records, setRecords] = React.useState<WFFlow[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [totalCount, setTotalCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const loadFlows = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchWFFlows({ page, pageSize });
      setRecords(response.items);
      setTotalCount(response.totalCount);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        "Não foi possível carregar os fluxos.";
      showToast({
        title: "Ops!",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, showToast]);

  React.useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  const handleDelete = React.useCallback(async (flow: WFFlow) => {
    const confirm = window.confirm(
      `Deseja remover o fluxo "${flow.description}"?`
    );
    if (!confirm) return;
    try {
      await deleteWFFlow(flow.id);
      showToast({ title: "Fluxo removido com sucesso!" });
      await loadFlows();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? "Não foi possível remover o fluxo.";
      showToast({
        title: "Ops!",
        description: message,
        variant: "destructive",
      });
    }
  }, [loadFlows, showToast]);

  const columns = React.useMemo<TableColumn<WFFlow>[]>(() => {
    return [
      { key: "description", label: "Descrição" },
      {
        key: "createdAt",
        label: "Criado em",
        render: (item) => formatDate(item.createdAt),
      },
      {
        key: "updatedAt",
        label: "Atualizado em",
        render: (item) => formatDate(item.updatedAt),
      },
    ];
  }, []);

  const actions = React.useMemo(() => {
    return {
      label: "Ações",
      render: (item: WFFlow) => (
        <>
          <button
            type="button"
            onClick={() =>
              navigate(`/configuracoes/fluxos/${item.id}/editar`)
            }
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
  }, [handleDelete, navigate]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <CrudHeader
        title="Fluxos"
        description="Visualize e configure os fluxos do processo."
        actionLabel="Cadastrar fluxo"
        onAction={() => navigate("/configuracoes/fluxos/novo")}
      />

      <div className="rounded-3xl border border-stone-200 bg-white/70 p-4 shadow-sm">
        <DataTable
          data={records}
          columns={columns}
          rowKey={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="Nenhum fluxo cadastrado ainda."
          actions={actions}
        />

        <PaginationControls
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={(nextPage) => {
            const totalPages = Math.max(
              1,
              Math.ceil((totalCount || 1) / pageSize)
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
