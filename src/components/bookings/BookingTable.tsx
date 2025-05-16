
import { useState } from 'react';
import { format } from 'date-fns';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/store/bookingsStore';

interface BookingTableProps {
  data: Booking[];
  onCancelBooking: (id: string) => void;
  isLoading?: boolean;
  showHallName?: boolean;
}

export function BookingTable({ 
  data, 
  onCancelBooking,
  isLoading = false,
  showHallName = true
}: BookingTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <div className="font-mono text-xs">{row.original.id.slice(0, 8)}...</div>,
    },
    showHallName ? {
      accessorKey: 'hallName',
      header: 'Hall Name',
      cell: ({ row }) => <div>{row.original.hallName}</div>,
    } : null,
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        return <div>{format(new Date(row.original.date), 'PP')}</div>;
      },
      sortingFn: "datetime",
    },
    {
      accessorKey: 'guestCount',
      header: 'Guests',
      cell: ({ row }) => <div>{row.original.guestCount}</div>,
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          {row.original.customerFirstName} {row.original.customerLastName}
          <div className="text-xs text-gray-500">{row.original.customerPhone}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={status === 'upcoming' ? 'outline' : 'secondary'}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const isUpcoming = row.original.status === 'upcoming';
        return (
          <AlertDialog open={bookingToCancel === row.original.id} onOpenChange={
            (open) => {
              if (!open) setBookingToCancel(null);
            }
          }>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm" 
                disabled={!isUpcoming || isLoading}
                onClick={() => setBookingToCancel(row.original.id)}
              >
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, keep booking</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onCancelBooking(row.original.id);
                    setBookingToCancel(null);
                  }}
                >
                  Yes, cancel booking
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
    },
  ].filter(Boolean) as ColumnDef<Booking>[];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHeader key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHeader>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No bookings found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
