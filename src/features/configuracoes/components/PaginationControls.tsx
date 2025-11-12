import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

type PaginationControlsProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function buildPageList(current: number, total: number) {
  if (total <= 1) {
    return [1];
  }

  const result: Array<number | 'ellipsis'> = [1];
  const delta = 1;
  const start = Math.max(2, current - delta);
  const end = Math.min(total - 1, current + delta);

  if (start > 2) {
    result.push('ellipsis');
  }

  for (let i = start; i <= end; i += 1) {
    result.push(i);
  }

  if (end < total - 1) {
    result.push('ellipsis');
  }

  result.push(total);
  return result;
}

export function PaginationControls({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize || 1));
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(totalCount, page * pageSize);
  const pageList = buildPageList(page, totalPages);

  const handlePageChange = (nextPage: number) => {
    const safePage = Math.min(Math.max(1, nextPage), totalPages);
    onPageChange(safePage);
  };

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-3xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        Mostrando <span className="font-semibold text-stone-900">{start}</span>-
        <span className="font-semibold text-stone-900">{end}</span> de{' '}
        <span className="font-semibold text-stone-900">{totalCount}</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-stone-500">
          por página
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-2xl border border-stone-200 bg-white px-3 py-1 text-sm text-stone-700"
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => handlePageChange(page - 1)} disabled={page <= 1} />
            </PaginationItem>
            {pageList.map((item, index) => {
              if (item === 'ellipsis') {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return (
                <PaginationItem key={item}>
                  <PaginationLink isActive={item === page} onClick={() => handlePageChange(item)}>
                    {item}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
