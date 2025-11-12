import React from 'react';
import { twMerge } from 'tailwind-merge';

export type TableColumn<T> = {
  key: string;
  label: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
};

type DataTableProps<T> = {
  data: T[];
  columns: TableColumn<T>[];
  rowKey: (item: T) => React.Key;
  isLoading?: boolean;
  emptyMessage?: string;
};

export function DataTable<T>({
  data,
  columns,
  rowKey,
  isLoading,
  emptyMessage = 'Nenhum registro encontrado',
}: DataTableProps<T>) {
  const resolveValue = (item: T, path: string) => {
    return path.split('.').reduce<any>((acc, key) => {
      if (acc && typeof acc === 'object') {
        return (acc as any)[key];
      }
      return undefined;
    }, item);
  };

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
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-sm text-stone-500"
                >
                  Carregando...
                </td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-sm text-stone-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data?.map((item) => (
                <tr key={rowKey(item)}>
                  {columns.map((column, index) => {
                    const isLast = index === columns.length - 1;
                    return (
                      <td
                        key={column.key}
                        className={twMerge(
                          'px-4 py-3 text-sm text-stone-700',
                          column.className,
                          isLast ? 'text-right' : undefined,
                        )}
                      >
                        {column.render
                          ? column.render(item)
                          : resolveValue(item, column.key)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
