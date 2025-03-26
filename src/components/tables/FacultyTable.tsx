import * as React from "react";
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
} from "@tanstack/react-table";
import { ArrowUpDown, FilterX, ListFilter, Loader2, MoreHorizontal, Pencil, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "../ui/badge";
import DeleteModal from "../DeleteModal";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { QRCodeSVG } from 'qrcode.react';
import { AddTeacher } from "../AddTeacher";
import { Skeleton } from "../ui/skeleton";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Label } from "../ui/label";
import MultiSelectDropdown from "../MultiSelectDropdown";

export type Teacher = {
  teacher_id: string;
  lastname: string;
  firstname: string;
  courses: Array<string>;
  sections: Array<string>;
  subjects: Array<string>;
  teacher_email: string;
  password: string;
};

const FormSchema = z.object({
  teacher_id: z.string().min(10, { message: "ID must have at least 10 characters" }),
  teacher_email: z.string().email({ message: "Invalid email address" }).min(1, { message: "Email is required" }),
  lastname: z.string().min(1, { message: "Last Name is required" }),
  firstname: z.string().min(1, { message: "First Name is required" }),
  courses: z.array(z.string()).min(1, { message: 'At least one course is required' }),
  sections: z.array(z.string()).min(1, { message: 'At least one section is required' }),
  subjects: z.array(z.string()).min(1, { message: 'At least one subject is required' }),
});

type FormData = z.infer<typeof FormSchema>;

export const columns = (
  setOpenQRModal: (open: boolean) => void,
  setId: (id: string) => void,
  handleEdit: (teacher: Teacher) => void
): ColumnDef<Teacher>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "teacher_id",
    header: "ID",
    cell: ({ row }) => <div className="capitalize">{row.getValue("teacher_id")}</div>,
  },
  {
    accessorKey: "lastname",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Last Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => <div>{row.getValue("lastname")}</div>,
  },
  {
    accessorKey: "firstname",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            First Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => <div>{row.getValue("firstname")}</div>,
  },
  {
    accessorKey: "teacher_email",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => <div>{row.getValue("teacher_email")}</div>,
  },
  {
    accessorKey: "subjects",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Subjects
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const subjects = row.getValue("subjects") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {subjects.map((subject, index) => (
            <Badge key={`${subject}-${index}`} variant="secondary">
              {subject}
            </Badge>
          ))}
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = (rowA.getValue(columnId) as string[]).join(', ');
      const b = (rowB.getValue(columnId) as string[]).join(', ');
      return a.localeCompare(b);
    },
  },
  {
    accessorKey: "courses",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Courses
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const courses = row.getValue("courses") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {courses.map((course, index) => (
            <Badge key={`${course}-${index}`} variant="secondary">
              {course}
            </Badge>
          ))}
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = (rowA.getValue(columnId) as string[]).join(', ');
      const b = (rowB.getValue(columnId) as string[]).join(', ');
      return a.localeCompare(b);
    },
    filterFn: (row, columnId, filterValue) => {
      const rowValue = row.getValue(columnId) as string[];
      return rowValue.includes(filterValue);
    },
  },
  {
    accessorKey: "sections",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Sections
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const sections = row.getValue("sections") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {sections.map((section, index) => (
            <Badge key={`${section}-${index}`} variant="secondary">
              {section}
            </Badge>
          ))}
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = (rowA.getValue(columnId) as string[]).join(', ');
      const b = (rowB.getValue(columnId) as string[]).join(', ');
      return a.localeCompare(b);
    },
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
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(teacher.teacher_id)}>
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              setId(row.original.teacher_id);
              setOpenQRModal(true);
            }}>
              <QrCode className="mr-2 h-4 w-4" />
              View QR Code
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(teacher)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function FacultyTable() {
  const [open, setOpen] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "lastname", desc: false }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [openQRModal, setOpenQRModal] = React.useState(false);
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [id, setId] = React.useState<string>('');
  const [loadingTable, setLoadingTable] = React.useState(true);
  const [teacherData, setTeacherData] = React.useState<Teacher | null>(null);
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [courses, setCourses] = React.useState<string[]>([]);
  const [subjects, setSubjects] = React.useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      teacher_id: teacherData?.teacher_id || "",
      teacher_email: teacherData?.teacher_email || "",
      lastname: teacherData?.lastname || "",
      firstname: teacherData?.firstname || "",
      courses: teacherData?.courses || [],
      sections: teacherData?.sections || [],
      subjects: teacherData?.subjects || [],
    },
  });

  const fetchTeachers = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/teacher/getTeachers");
      setTeachers(response.data);
      setLoadingTable(false);
    } catch (error) {
      console.error("Error fetching users", error);
      toast.error("Failed to fetch teachers");
      setLoadingTable(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/acads/getCourses");
      const courseNames = response.data.map((course: { course: string }) => course.course);
      setCourses(courseNames);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/acads/getSubjects");
      const subjectNames = response.data.map((subject: { subject: string }) => subject.subject);
      setSubjects(subjectNames);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects");
    }
  };

  const deleteUser = async () => {
    setLoading(true);
    try {
      const selectedRows = table.getSelectedRowModel().rows;
      const deletePromises = selectedRows.map(row => 
        axios.delete(`https://comlab-backend.vercel.app/api/teacher/deleteTeacher/${row.original.teacher_id}`)
      );
      
      await Promise.all(deletePromises);
      toast.info(`${selectedRows.length} Teacher/s has been deleted.`);
      fetchTeachers();
      setRowSelection({});
    } catch (error) {
      console.error("Error deleting users", error);
      toast.error("Failed to delete teachers");
    } finally {
      setLoading(false);
      setOpenDelete(false);
    }
  };

  React.useEffect(() => {
    fetchTeachers();
    fetchCourses();
    fetchSubjects();
  }, []);

  const handleEdit = (teacher: Teacher) => {
    setTeacherData(teacher);
    setOpenEditModal(true);
    reset({
      teacher_id: teacher.teacher_id,
      teacher_email: teacher.teacher_email,
      lastname: teacher.lastname,
      firstname: teacher.firstname,
      courses: teacher.courses,
      sections: teacher.sections,
      subjects: teacher.subjects,
    });
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const newData = {
        teacher_id: data.teacher_id,
        teacher_email: data.teacher_email,
        lastname: data.lastname,
        firstname: data.firstname,
        courses: data.courses,
        sections: data.sections,
        subjects: data.subjects
      };
      
      const response = await axios.post("https://comlab-backend.vercel.app/api/teacher/editTeacher", newData);
      if (response.status === 200) {
        toast.success("Teacher updated successfully");
        fetchTeachers();
        setOpenEditModal(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update teacher");
    } finally {
      setLoading(false);
    }
  };

  const table = useReactTable({
    data: teachers,
    columns: columns(setOpenQRModal, setId, handleEdit),
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

  const uniqueCourses = Array.from(
    new Set(teachers.flatMap(teacher => teacher.courses))
  ).sort();

  return (
    <>
      {loadingTable ? (
        <div className="w-full">
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min relative">
            <div className="flex items-center py-4 font-geist justify-between">
              <div className="w-1/2 flex gap-2">
                <Skeleton className="w-[30%] h-10"/>
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
      ) : (
        <div className="w-full">
          <div className="flex items-center justify-between py-4">
            <div className="flex justify-between">
              <Input
                placeholder="Filter by name..."
                value={(table.getColumn("lastname")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("lastname")?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-2 border-dashed bg-transparent">
                    <ListFilter className="mr-1" /> Course
                    {table.getColumn("courses")?.getFilterValue() ? (
                      <div className="flex gap-2">
                        <span className="font-thin text-gray-500">|</span>
                        <Badge variant={"secondary"}>
                          {String(table.getColumn("courses")?.getFilterValue())}
                        </Badge>
                      </div>
                    ) : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="font-geist w-40">
                  {uniqueCourses.map((course) => (
                    <DropdownMenuItem 
                      key={course} 
                      onClick={() => table.getColumn("courses")?.setFilterValue(course)}
                    >
                      {course}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => table.getColumn("courses")?.setFilterValue(undefined)}>
                    <FilterX size={16} /> Clear Filter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex gap-2">
              {Object.keys(rowSelection).length !== 0 && (
                <DeleteModal
                  title={`Delete (${Object.keys(rowSelection).length})`}
                  description={`Are you sure you want to delete ${Object.keys(rowSelection).length} teacher(s)?`}
                  open={openDelete}
                  setOpen={setOpenDelete}
                  onClick={deleteUser}
                  loading={loading}
                />
              )}
              <AddTeacher open={open} setOpen={setOpen} fetch={fetchTeachers} />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => table.previousPage()} 
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => table.nextPage()} 
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
          
          {/* QR Code Dialog */}
          <Dialog open={openQRModal} onOpenChange={setOpenQRModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>QR Code</DialogTitle>
                <DialogDescription>
                  This is the QR code for the selected teacher.
                </DialogDescription>
                <div className="w-full flex items-center justify-center">
                  <div className="w-fit">
                    <QRCodeSVG value={id.toString()} size={300} />
                  </div>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          
          {/* Edit Teacher Dialog */}
          <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
            <DialogContent className="sm:max-w-[425px] font-geist">
              <DialogHeader>
                <DialogTitle>Edit Teacher</DialogTitle>
                <DialogDescription>Click submit when you're done.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  {/* Teacher ID */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="teacher_id" className="text-right">ID</Label>
                    <div className="col-span-3 relative">
                      <Input 
                        id="teacher_id" 
                        {...register('teacher_id')} 
                        placeholder="########" 
                        disabled
                      />
                      {errors.teacher_id && (
                        <span className="text-red-500 text-xs font-geist">
                          {errors.teacher_id.message}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Teacher Email */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="teacher_email" className="text-right">Email</Label>
                    <div className="col-span-3 relative">
                      <Input id="teacher_email" {...register('teacher_email')} placeholder="Email" />
                      {errors.teacher_email && (
                        <span className="text-red-500 text-xs font-geist">
                          {errors.teacher_email.message}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lastname" className="text-right">Last Name</Label>
                    <div className="col-span-3 relative">
                      <Input id="lastname" {...register('lastname')} placeholder="Last Name" />
                      {errors.lastname && (
                        <span className="text-red-500 text-xs font-geist">
                          {errors.lastname.message}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* First Name */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="firstname" className="text-right">First Name</Label>
                    <div className="col-span-3 relative">
                      <Input id="firstname" {...register('firstname')} placeholder="First Name" />
                      {errors.firstname && (
                        <span className="text-red-500 text-xs font-geist">
                          {errors.firstname.message}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="subjects" className="text-right">Subjects</Label>
                    <div className="col-span-3 relative">
                      <Controller
                        name="subjects"
                        control={control}
                        render={({ field }) => (
                          <MultiSelectDropdown
                            options={subjects}
                            onChange={field.onChange}
                            defaultValue={field.value}
                          />
                        )}
                      />
                      {errors.subjects && (
                        <p className="text-red-500 text-xs">
                          {errors.subjects.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Courses */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="courses" className="text-right">Courses</Label>
                    <div className="col-span-3 relative">
                      <Controller
                        name="courses"
                        control={control}
                        render={({ field }) => (
                          <MultiSelectDropdown
                            options={courses}
                            onChange={field.onChange}
                            defaultValue={field.value}
                          />
                        )}
                      />
                      {errors.courses && (
                        <p className="text-red-500 text-xs">
                          {errors.courses.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sections" className="text-right">Sections</Label>
                    <div className="col-span-3 relative">
                      <Controller
                        name="sections"
                        control={control}
                        render={({ field }) => (
                          <MultiSelectDropdown
                            options={[
                              '1A', '1B', '1C', '1D', '1E', '1F', '1G', '1H', '1I', '1J',
                              '2A', '2B', '2C', '2D', '2E', '2F', '2G', '2H', '2I', '2J',
                              '3A', '3B', '3C', '3D', '3E', '3F', '3G', '3H', '3I', '3J',
                              '4A', '4B', '4C', '4D', '4E', '4F', '4G', '4H', '4I', '4J',
                            ]}
                            onChange={field.onChange}
                            defaultValue={field.value}
                          />
                        )}
                      />
                      {errors.sections && (
                        <p className="text-red-500 text-xs">
                          {errors.sections.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex items-center">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        Updating
                        <Loader2 className="animate-spin ml-2" />
                      </>
                    ) : (
                      "Update"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
}