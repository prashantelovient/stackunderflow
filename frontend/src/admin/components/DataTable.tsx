import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  flexRender, type ColumnDef,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Search, ListFilter } from 'lucide-react'
import { cn } from '@/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T, unknown>[]
  searchPlaceholder?: string
  searchKey?: keyof T
}

export function DataTable<T>({ data, columns, searchPlaceholder = 'Search...', searchKey }: DataTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Filters Strip */}
      {searchKey !== undefined && (
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-card/50 p-4 rounded-2xl border border-border/50">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-11 h-11 bg-muted/20 border-border/50 focus:ring-primary/20 rounded-xl transition-all shadow-inner"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="h-11 rounded-xl border-border/50 bg-background/50 hover:bg-muted font-bold text-[10px] tracking-widest uppercase">
              <ListFilter className="w-4 h-4 mr-2" />
              Filter Systems
            </Button>
            <Badge variant="secondary" className="h-11 px-4 rounded-xl bg-primary/10 text-primary border-none font-bold text-[10px] tracking-widest uppercase hidden md:flex items-center">
              {data.length} ENTRIES
            </Badge>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-[2.5rem] border border-border/50 bg-card overflow-hidden shadow-2xl shadow-black/5 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent border-border/50">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="h-14 font-extrabold text-[10px] uppercase tracking-widest text-muted-foreground px-6 first:pl-10">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest">No Intelligence Found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="group border-border/30 hover:bg-muted/30 transition-colors duration-300">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 px-6 first:pl-10 text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors duration-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-muted/20 rounded-2xl border border-border/30">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/60 ml-2">
          Page <span className="text-foreground">{table.getState().pagination.pageIndex + 1}</span> of <span className="text-foreground">{table.getPageCount()}</span> — Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)}
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl border-border/50 bg-background/50 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-1.5 hidden sm:flex">
            {Array.from({ length: table.getPageCount() }, (_, i) => i).slice(
              Math.max(0, table.getState().pagination.pageIndex - 1),
              Math.min(table.getPageCount(), table.getState().pagination.pageIndex + 2)
            ).map((page) => (
              <Button
                key={page}
                variant={table.getState().pagination.pageIndex === page ? 'default' : 'ghost'}
                className={cn(
                  "h-10 min-w-[40px] text-[11px] font-black rounded-xl transition-all duration-300",
                  table.getState().pagination.pageIndex === page
                    ? "bg-primary text-white shadow-lg shadow-primary/25 translate-y-[-2px]"
                    : "hover:bg-primary/10 hover:text-primary"
                )}
                onClick={() => table.setPageIndex(page)}
              >
                {(page + 1).toString().padStart(2, '0')}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl border-border/50 bg-background/50 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
