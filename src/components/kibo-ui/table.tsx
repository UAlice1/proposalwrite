"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type Table as TableType,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

export type { ColumnDef };

interface TableProviderProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  children: React.ReactNode;
}

const TableContext = React.createContext<TableType<any> | null>(null);

export function TableProvider<TData>({
  columns,
  data,
  children,
}: TableProviderProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <TableContext.Provider value={table}>
      <div className="rounded-md border">
        <table className="w-full border-collapse">{children}</table>
      </div>
    </TableContext.Provider>
  );
}

function useTable() {
  const context = React.useContext(TableContext);
  if (!context) {
    throw new Error("Table components must be used within TableProvider");
  }
  return context;
}

interface TableHeaderProps {
  children: (props: {
    headerGroup: any;
  }) => React.ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  const table = useTable();
  return (
    <thead className="bg-muted/50">
      {table.getHeaderGroups().map((headerGroup: any) => children({ headerGroup }))}
    </thead>
  );
}

interface TableHeaderGroupProps {
  headerGroup: any;
  children: (props: {
    header: any;
  }) => React.ReactNode;
}

export function TableHeaderGroup({
  headerGroup,
  children,
}: TableHeaderGroupProps) {
  return <tr>{headerGroup.headers.map((header: any) => children({ header }))}</tr>;
}

interface TableHeadProps {
  header: any;
}

export function TableHead({ header }: TableHeadProps) {
  return (
    <th
      key={header.id}
      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
    >
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext())}
    </th>
  );
}

interface TableColumnHeaderProps {
  column: any;
  title: string;
  className?: string;
}

export function TableColumnHeader({
  column,
  title,
  className,
}: TableColumnHeaderProps) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <button
      className={cn(
        "flex items-center gap-2 hover:text-foreground transition-colors",
        className
      )}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      {column.getIsSorted() === "asc" ? (
        <ChevronUp className="h-4 w-4" />
      ) : column.getIsSorted() === "desc" ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ArrowUpDown className="h-4 w-4 opacity-50" />
      )}
    </button>
  );
}

interface TableBodyProps<TData> {
  children: (props: { row: any }) => React.ReactNode;
}

export function TableBody<TData>({ children }: TableBodyProps<TData>) {
  const table = useTable();
  return (
    <tbody>
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row: any) => children({ row }))
      ) : (
        <tr>
          <td
            colSpan={table.getAllColumns().length}
            className="h-24 text-center text-muted-foreground"
          >
            No results.
          </td>
        </tr>
      )}
    </tbody>
  );
}

interface TableRowProps {
  row: any;
  children: (props: {
    cell: any;
  }) => React.ReactNode;
  className?: string;
}

export function TableRow({ row, children, className }: TableRowProps) {
  return (
    <tr
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      data-state={row.getIsSelected() && "selected"}
    >
      {row.getVisibleCells().map((cell: any) => children({ cell }))}
    </tr>
  );
}

interface TableCellProps {
  cell: any;
}

export function TableCell({ cell }: TableCellProps) {
  return (
    <td className="p-4 align-middle">
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
}
