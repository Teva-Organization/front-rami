import React from 'react';
import { twMerge } from 'tailwind-merge';

export type TableColumn<T> = {
  key: string;
  label: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
};

export type TableActions<T> = {
  label?: string;
  className?: string;
  render: (item: T) => React.ReactNode;
};

type DataTableProps<T> = {
  data: T[];
  columns: TableColumn<T>[];
  rowKey: (item: T) => React.Key;
  isLoading?: boolean;
  emptyMessage?: string;
  actions?: TableActions<T>;
};

export function DataTable<T>({
  data,
  columns,
  rowKey,
  isLoading,
  emptyMessage = 'Nenhum registro encontrado',
  actions,
}: DataTableProps<T>) {
  const resolveValue = (item: T, path: string) => {
    return path.split('.').reduce<any>((acc, key) => {
      if (acc && typeof acc === 'object') {
        return (acc as any)[key];
      }
      return undefined;
    }, item);
  };

  const columnCount = columns.length + (actions ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-100">
          <thead className="bg-stone-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={twMerge(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500',
                    column.className,
                  )}
                >
                  {column.label}
                </th>
              ))}
              {actions ? (
                <th
                  className={twMerge(
                    'sticky right-0 bg-stone-50 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-stone-500',
                    actions.className,
                  )}
                >
                  {actions.label ?? 'Ações'}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {isLoading ? (
              <tr>
                <td colSpan={columnCount} className="px-4 py-6 text-center text-sm text-stone-500">
                  Carregando...
                </td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="px-4 py-6 text-center text-sm text-stone-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data?.map((item) => (
                <tr key={rowKey(item)}>
                  {columns.map((column, index) => {
                    const shouldRightAlign = !actions && index === columns.length - 1;
                    return (
                      <td
                        key={column.key}
                        className={twMerge(
                          'px-4 py-3 text-sm text-stone-700',
                          column.className,
                          shouldRightAlign ? 'text-right' : undefined,
                        )}
                      >
                        {column.render
                          ? column.render(item)
                          : resolveValue(item, column.key)}
                      </td>
                    );
                  })}
                  {actions ? (
                    <td
                      className={twMerge(
                        'sticky right-0 bg-white px-4 py-3 text-sm text-stone-700',
                        actions.className,
                      )}
                    >
                      <div className="flex items-center justify-end gap-2">
                        {actions.render(item)}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
