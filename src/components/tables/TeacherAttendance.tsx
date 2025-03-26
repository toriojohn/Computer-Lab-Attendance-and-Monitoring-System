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
import { ArrowUpDown, ChevronLeft, ChevronRight, FilterX, MoreHorizontal, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Skeleton } from "../ui/skeleton"
import { useNavigate } from "react-router-dom"
import * as XLSX from 'xlsx'; 

export type Teacher = {
  teacher_id: string,
  course_section: string,
  date: string,
  time_in: string,
  time_out: string,
  teacher_name: string,
  subject: string,
  unique: string,
  comlab: string,
}

export const columns: ColumnDef<Teacher>[] = [
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
    accessorKey: "teacher_id",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            ID
            <ArrowUpDown />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div>{row.getValue("teacher_id")}</div>,
  },
  {
    accessorKey: "teacher_name",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Teacher
            <ArrowUpDown />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div>{row.getValue("teacher_name")}</div>,
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
    accessorKey: "comlab",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Com Lab
            <ArrowUpDown />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div>{row.getValue("comlab")}</div>,
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
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const teacher = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(teacher.teacher_id)}
            >
              Copy teacher ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]

// interface TeacherAttendanceRecordProps {
//   refreshKey: number;
// }

export function TeacherAttendance() {
  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState<SortingState>([{id: "teacher_name", desc: false}]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [attendanceList, setAttendanceList] = React.useState<Teacher[]>([]);
  const [loadingTable, setLoadingTable] = React.useState(true);

  const initialRender = React.useRef(true);

  React.useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get("https://comlab-backend.vercel.app/api/teacher/getTeacherAttendance");
        setAttendanceList(response.data);
        setLoadingTable(false);
        console.log("API Response:", response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchAttendance();
  }, []);

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
  });

  const uniqueCourses = Array.from(new Set(attendanceList.map((attendanceList) => attendanceList.course_section)));
  const uniqueDates = Array.from(new Set(attendanceList.map((attendanceList) => attendanceList.date)));

  React.useEffect(() => {
    if (initialRender.current && uniqueDates.length > 0 && !table.getColumn("date")?.getFilterValue()) {
      table.getColumn("date")?.setFilterValue(uniqueDates[0]);
      initialRender.current = false;
    }
  }, [uniqueDates, table]);

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
    <>
      {loadingTable ? (
        <div className="w-full">
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min relative ">
            <div className="flex items-center py-4 font-geist justify-between">
              <div className="w-1/2 flex gap-2">
                <Skeleton className="w-[50%] h-10"/>
                <Skeleton className="w-[10%]"/>
                <Skeleton className="w-[10%]"/>
              </div>
              <div className="flex gap-2">
                <Skeleton className="w-20 h-10"/>
              </div>
            </div>
            <div className="rounded-md border font-geist">
              <Skeleton className="h-96 w-full"></Skeleton>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4 font-geist">
              <Skeleton className="h-10 w-20"></Skeleton>
              <div className="space-x-2 flex">
              <Skeleton className="w-20 h-8"/>
              <Skeleton className="w-20 h-8"/>
              </div>
            </div>
          </div>
        </div>
      ):(
        <div className="w-full">
          <div className="flex items-center py-4">
            <div className="flex justify-between">
              <Input
                placeholder="Filter by teacher name..."
                value={(table.getColumn("teacher_name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("teacher_name")?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-2 border-dashed bg-transparent">
                    <PlusCircle className="mr-1" /> Course & Section
                    {table.getColumn("course_section")?.getFilterValue() ? (
                      <div className="flex gap-2">
                        <span className="font-thin text-gray-500">|</span>
                        <Badge variant={"secondary"}>
                          {String(table.getColumn("course_section")?.getFilterValue())}
                        </Badge>
                      </div>
                    ) : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="font-geist w-40">
                  {uniqueCourses.map((course_section) => (
                    <DropdownMenuItem key={course_section} onClick={() => table.getColumn("course_section")?.setFilterValue(course_section)}>
                      {course_section}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => table.getColumn("course_section")?.setFilterValue(undefined)}>
                    <FilterX size={16} /> Clear Filter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-2 border-dashed bg-transparent">
                    <PlusCircle className="mr-1" /> Date
                    {table.getColumn("date")?.getFilterValue() ? (
                      <div className="flex gap-2">
                        <span className="font-thin text-gray-500">|</span>
                        <Badge variant={"secondary"}>
                          {String(table.getColumn("date")?.getFilterValue())}
                        </Badge>
                      </div>
                    ) : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="font-geist w-40">
                  {uniqueDates.reverse().map((date) => (
                    <DropdownMenuItem key={date} onClick={() => table.getColumn("date")?.setFilterValue(date)}>
                      {date}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => table.getColumn("date")?.setFilterValue(undefined)}>
                    <FilterX size={16} /> Clear Filter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={exportToExcel} variant="outline" size="sm">
                Export to Excel
              </Button>
            </div>
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
                  table.getRowModel().rows.map((row) => (
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
          <Button className="float-end" variant={"ghost"} onClick={() => navigate("/admin/attendanceRecord/studentsRecord")}>See Students Attendance</Button> 
        </div>
      )}
    </>
  );
}