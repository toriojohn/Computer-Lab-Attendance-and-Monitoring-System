import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "../ui/badge"
import axios from "axios"
import * as XLSX from 'xlsx'; 

export type Student = {
  student_id: string,
  teacher_id: string,
  course_section: string,
  date: string,
  time_in: string,
  time_out: string,
  status: "Present" | "Absent" | "Late" | "Excused",
  teacher_name: string,
  subject: string,
  student_name: string,
}

export const columns: ColumnDef<Student>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "student_name",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Student
            <ArrowUpDown />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div>{row.getValue("student_name")}</div>,
  },
  {
    accessorKey: "subject",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Subject
            <ArrowUpDown />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div>{row.getValue("subject")}</div>,
  },
  {
    accessorKey: "course_section",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Course & Section
            <ArrowUpDown />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div>{row.getValue("course_section")}</div>,
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Date
            <ArrowUpDown />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div>{row.getValue("date")}</div>,
  },
  {
    accessorKey: "time_in",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Time In
            <ArrowUpDown />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div>{row.getValue("time_in") === null ? "-----" : row.getValue("time_in")}</div>,
  },
  {
    accessorKey: "time_out",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Time Out
            <ArrowUpDown />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div>{row.getValue("time_out") === null ? "-----" : row.getValue("time_out")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Status
            <ArrowUpDown />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">
        <Badge
          className={`
            ${row.getValue("status") === 'Absent' ? 'bg-red-200 text-red-900 hover:bg-red-200' :
              row.getValue("status") === 'Late' ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-200' :
                row.getValue("status") === 'Excused' ? 'bg-blue-200 text-blue-800 hover:bg-blue-200' :
                  'bg-green-200 text-green-800 hover:bg-green-200'
            }
            cursor-default
          `}
        >
          {row.getValue("status")}
        </Badge>
      </div>
    )
  },
]

interface QRAttendanceTableProps {
  refreshKey: number;
}

export function QRAttendanceTable({ refreshKey }: QRAttendanceTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([{id: "student_name", desc: false}])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const [attendanceList, setAttendanceList] = React.useState<Student[]>([])

  React.useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get("https://comlab-backend.vercel.app/api/student/getAttendance")
        // Filter the data to show only rows where time_in is not null
        // const filteredData = response.data.filter((student: Student) => student.time_in !== null);
        setAttendanceList(response.data);
      } catch (error) {
        console.log(error)
      }
    }

    fetchAttendance();
  }, [refreshKey])

  const table = useReactTable({
    data: attendanceList,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const exportToExcel = () => {
    const exportData = table.getRowModel().rows.map((row) => {
      return row.getVisibleCells().reduce((acc, cell) => {
        acc[cell.column.id] = cell.getValue();
        return acc;
      }, {} as Record<string, any>); // Use Record type to ensure proper typing
    });

    // Create a new workbook
    const ws = XLSX.utils.json_to_sheet(exportData);  // Convert the rows into an Excel sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Data');  // Append the sheet to the workbook

    // Export the Excel file
    XLSX.writeFile(wb, 'attendance_data.xlsx');
  };

  return (
    <div className="w-full z-50">
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Filter student..."
          value={(table.getColumn("student_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("student_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm text-xs"
        />
           <div className="flex justify-end py-4">
        <Button onClick={exportToExcel} variant="outline" size="sm">
          Export to Excel
        </Button>
      </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto text-xs">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize text-xs"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="text-xs">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-xs">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows
                .filter((row) => row.original.status !== "Absent") // Filter rows with status "Absent"
                .map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="text-xs"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-muted-foreground text-xs">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}