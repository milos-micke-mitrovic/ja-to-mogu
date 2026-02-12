'use client';

import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  OnChangeFn,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  // Server-side pagination
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  // Server-side sorting (optional)
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage = 'Nema podataka',
  pageIndex,
  pageSize,
  pageCount,
  totalItems,
  onPageChange,
  sorting: externalSorting,
  onSortingChange: externalOnSortingChange,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);

  // Use external sorting if provided, otherwise use internal
  const sorting = externalSorting ?? internalSorting;
  const onSortingChange = externalOnSortingChange ?? setInternalSorting;

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange,
    manualPagination: true,
    pageCount,
    state: {
      sorting,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  });

  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'px-4 py-3 text-left text-sm font-medium text-foreground-muted',
                        canSort && 'cursor-pointer select-none hover:text-foreground'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="ml-1">
                            {sorted === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : sorted === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronsUpDown className="h-4 w-4 opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-foreground-muted">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-sm text-foreground-muted">
            Stranica {pageIndex + 1} od {pageCount} ({totalItems} rezultata)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pageIndex - 1)}
              disabled={!canPreviousPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pageIndex + 1)}
              disabled={!canNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
