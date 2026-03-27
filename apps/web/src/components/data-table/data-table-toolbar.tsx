'use client';

import { Cross2Icon, DownloadIcon, MixerHorizontalIcon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTableViewOptions } from './data-table-view-options';
import { DataTableFacetedFilter } from './data-table-faceted-filter';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  searchPlaceholder?: string;
  filters?: {
    column: string;
    title: string;
    options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[];
  }[];
  onExport?: () => void;
  onBulkAction?: (selectedRows: TData[]) => void;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = 'Buscar...',
  filters,
  onExport,
  onBulkAction,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {/* Global Search */}
          {searchKey && (
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="h-8 w-[150px] lg:w-[250px]"
            />
          )}

          {/* Faceted Filters */}
          {filters?.map((filter) => {
            const column = table.getColumn(filter.column);
            if (!column) return null;

            return (
              <DataTableFacetedFilter
                key={filter.column}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            );
          })}

          {/* Clear Filters */}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Limpar
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Bulk Actions */}
          {selectedRows.length > 0 && onBulkAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction(selectedRows)}
              className="h-8"
            >
              Ações ({selectedRows.length})
            </Button>
          )}

          {/* Export */}
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="h-8"
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          )}

          {/* View Options */}
          <DataTableViewOptions table={table} />
        </div>
      </div>
    </div>
  );
}
