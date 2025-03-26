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
import { AddStudent } from "../AddStudent";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "../ui/label";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Define the Student type
export type Student = {
  student_id: string;
  email: string;
  lastname: string;
  firstname: string;
  course: string;
  section: string;
};

// Define the Zod schema for form validation
const FormSchema = z.object({
  student_id: z.string().min(10, { message: "ID must have at least 10 characters" }),
  email: z.string().email({ message: "Invalid email address" }).min(1, { message: "Email is required" }),
  lastname: z.string().min(1, { message: "Last Name is required" }),
  firstname: z.string().min(1, { message: "First Name is required" }),
  course: z.string().optional(),
  yearlevel: z.string().optional(),
  section: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;

// Define the table columns
export const columns = ( setOpenQRModal: (open: boolean) => void,setId: (id: string) => void,handleEdit: (student: Student) => void): ColumnDef<Student>[] => [
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
    accessorKey: "student_id",
    header: "ID",
    cell: ({ row }) => <div className="capitalize">{row.getValue("student_id")}</div>,
  },
  {
    accessorKey: "lastname",
    header: ({ column }) => (
      <div className="text-left">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-xs pl-0 bg-transparent"
        >
          Last Name
          <ArrowUpDown />
        </Button>
      </div>
    ),
    cell: ({ row }) => <div>{row.getValue("lastname")}</div>,
  },
  {
    accessorKey: "firstname",
    header: ({ column }) => (
      <div className="text-left">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-xs pl-0 bg-transparent"
        >
          First Name
          <ArrowUpDown />
        </Button>
      </div>
    ),
    cell: ({ row }) => <div>{row.getValue("firstname")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <div className="text-left">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-xs pl-0 bg-transparent"
        >
          Email
          <ArrowUpDown />
        </Button>
      </div>
    ),
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    accessorKey: "course",
    header: ({ column }) => (
      <div className="text-left">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-xs pl-0 bg-transparent"
        >
          Course
          <ArrowUpDown />
        </Button>
      </div>
    ),
    cell: ({ row }) => <div>{row.getValue("course")}</div>,
  },
  {
    accessorKey: "section",
    header: ({ column }) => (
      <div className="text-left">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-xs pl-0 bg-transparent"
        >
          Section
          <ArrowUpDown />
        </Button>
      </div>
    ),
    cell: ({ row }) => <div>{row.getValue("section")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const student = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(student.student_id)}>
              Copy student ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              setId(row.original.student_id);
              setOpenQRModal(true);
            }}>
              <QrCode className="mr-2 h-4 w-4" />
              View QR Code
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(student)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Main Component
export function CoursesAndSectionTable() {
  const [open, setOpen] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "lastname", desc: false }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [openQRModal, setOpenQRModal] = React.useState(false);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [id, setId] = React.useState<string>('');
  const [loadingTable, setLoadingTable] = React.useState(true);
  const [studentCount, setStudentCount] = React.useState(0);
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [studentData, setStudentData] = React.useState<Student | null>(null);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      student_id: studentData?.student_id || "",
      email: studentData?.email || "",
      lastname: studentData?.lastname || "",
      firstname: studentData?.firstname || "",
      course: studentData?.course || "",
      section: studentData?.section || "",
    },
  });

  // Fetch students from the backend
  const fetchStudents = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/student/getStudents");
      setStudents(response.data);
      setStudentCount(response.data.length);
      setLoadingTable(false);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const [courses, setCourses] = React.useState<{ _id: string, course: string; course_code: string }[]>([])
  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("https://comlab-backend.vercel.app/api/acads/getCourses");
        setCourses(response.data)
      } catch (error) {
        console.error(error);
      }
    }
    fetchCourses();
  },[])

  // const yearLevel = watch("yearlevel");
  // const section = watch("section");
  // const combinedSection = yearLevel && section ? `${yearLevel}${section}` : "1A";

  // Handle edit action
  const handleEdit = (student: Student) => {
    
    const year = student.section ? student.section.charAt(0) : '1'; // Default to '1' if empty
    const sectionLetter = student.section ? student.section.slice(1) : 'A'; // Default to 'A' if empty
    
    setStudentData(student);
    setOpenEditModal(true);
    reset({
      ...student,
      yearlevel: year,  // Temporary field for the form
      section: sectionLetter // Only the letter part
    });
  };

  // Handle form submission
  const onSubmit = async (data: FormData & { yearlevel?: string }) => {
    setLoading(true);
    const combinedSection2 = `${data.yearlevel || '1'}${data.section || 'A'}`;
    const newData = {student_id: data.student_id, firstname: data.firstname, lastname: data.lastname, course: data.course, section: combinedSection2}; 
    try{
      const response = await axios.post("https://comlab-backend.vercel.app/api/student/editStudent", newData)
      if (response.status === 200) {
        toast.success("Student updated successfully");
        fetchStudents(); // Refresh the student list
        setOpenEditModal(false);
        setLoading(false)
      }
    }
    catch(error){
      console.error(error)
      setLoading(false)
    }
  };

  // Handle delete action
  const deleteUser = async () => {
    setLoading(true);
    try {
      const selectedRows = table.getSelectedRowModel().rows;
      for (const row of selectedRows) {
        const studentId = row.original.student_id;
        await axios.delete(`https://comlab-backend.vercel.app/api/student/deleteStudent/${studentId}`);
        console.log(`Deleted user with ID: ${studentId}`);
      }
      toast.info(`${selectedRows.length} User/s has been deleted.`);
      fetchStudents();
      setRowSelection({});
      setOpenDelete(false);
    } catch (error) {
      console.error("Error deleting a user", error);
      toast.error("Unknown error has occurred");
    } finally {
      setLoading(false);
    }
  };

  // Fetch students on component mount
  React.useEffect(() => {
    fetchStudents();
  }, []);

  // React Table setup
  const table = useReactTable({
    data: students,
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

  // Generate unique values for course and section
  const uniqueCourses = Array.from(new Set(students.map((student) => student.course)));
  const uniqueSections = Array.from(new Set(students.map((student) => student.section)));

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
                    {table.getColumn("course")?.getFilterValue() ? (
                      <div className="flex gap-2">
                        <span className="font-thin text-gray-500">|</span>
                        <Badge variant={"secondary"}>
                          {String(table.getColumn("course")?.getFilterValue())}
                        </Badge>
                      </div>
                    ) : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="font-geist w-40">
                  {uniqueCourses.map((course) => (
                    <DropdownMenuItem key={course} onClick={() => table.getColumn("course")?.setFilterValue(course)}>
                      {course}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => table.getColumn("course")?.setFilterValue(undefined)}>
                    <FilterX size={16} /> Clear Filter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-2 border-dashed bg-transparent">
                    <ListFilter className="mr-1" /> Section
                    {table.getColumn("section")?.getFilterValue() ? (
                      <div className="flex gap-2">
                        <span className="font-thin text-gray-500">|</span>
                        <Badge variant={"secondary"}>
                          {String(table.getColumn("section")?.getFilterValue())}
                        </Badge>
                      </div>
                    ) : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="font-geist w-40">
                  {uniqueSections.map((section) => (
                    <DropdownMenuItem key={section} onClick={() => table.getColumn("section")?.setFilterValue(section)}>
                      {section}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => table.getColumn("section")?.setFilterValue(undefined)}>
                    <FilterX size={16} /> Clear Filter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex gap-2">
              {Object.keys(rowSelection).length !== 0 && (
                <DeleteModal
                  title={`Delete (${Object.keys(rowSelection).length})`}
                  description={`Are you sure you want to delete ${Object.keys(rowSelection).length} student(s)?`}
                  open={openDelete}
                  setOpen={setOpenDelete}
                  onClick={deleteUser}
                  loading={loading}
                />
              )}
              <AddStudent open={open} setOpen={setOpen} fetch={fetchStudents} />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="text-xs">
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
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="text-xs">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
            <div className="flex-1 text-sm text-muted-foreground flex flex-col">
              {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
              <span className="text-xs">Total Students: {studentCount}</span>
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </div>
          <Dialog open={openQRModal} onOpenChange={setOpenQRModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>QR Code</DialogTitle>
                <DialogDescription>
                  This is the QR code for the selected student ({id})
                </DialogDescription>
                <div className="w-full flex items-center justify-center">
                  <div className="w-fit">
                    <QRCodeSVG value={id.toString()} size={300} />
                  </div>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
            <DialogContent className="sm:max-w-[425px] font-geist">
              <DialogHeader>
                <DialogTitle>Edit Details</DialogTitle>
                <DialogDescription>
                  Click submit when you're done.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="student_id" className="text-right">
                      ID
                    </Label>
                    <div className="col-span-3 relative">
                      <Input
                        id="student_id"
                        className="col-span-3"
                        {...register("student_id")}
                        disabled
                      />
                      {errors.student_id && <span className="text-red-500 text-xs">{errors.student_id.message}</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <div className="col-span-3 relative">
                      <Input
                        id="email"
                        className="col-span-3"
                        {...register("email")}
                      />
                      {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lastname" className="text-right">
                      Last Name
                    </Label>
                    <div className="col-span-3 relative">
                      <Input
                        id="lastname"
                        className="col-span-3"
                        {...register("lastname")}
                      />
                      {errors.lastname && <span className="text-red-500 text-xs">{errors.lastname.message}</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="firstname" className="text-right">
                      First Name
                    </Label>
                    <div className="col-span-3 relative">
                      <Input
                        id="firstname"
                        className="col-span-3"
                        {...register("firstname")}
                      />
                      {errors.firstname && <span className="text-red-500 text-xs">{errors.firstname.message}</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="course" className="text-right">
                      Course
                    </Label>
                    <div className="col-span-3 font-geist text-[14px]">
                      <select
                        id="course"
                        {...register("course")}
                        className="w-[120px] p-2 border rounded-md font-geist bg-white"
                      >
                        {courses.map((course) => (
                          <option key={course._id} value={course.course}>
                            {course.course}
                          </option>
                        ))}
                      </select>
                      {errors.course && <p className="text-red-500 text-xs">{errors.course.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="section" className="text-right">
                      Section
                    </Label>
                    <div className="flex gap-4">
                      <div className="font-geist text-[14px]">
                        <select
                          id="yearlevel"
                          {...register("yearlevel")}
                          className="w-[120px] p-2 border rounded-md font-geist bg-white"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                        </select>
                        {errors.yearlevel && <span className="text-red-500 text-xs">{errors.yearlevel.message}</span>}
                      </div>
                      <div className="w-full font-geist text-[14px]">
                          <select
                            id="section"
                            {...register("section")}
                            className="w-[120px] p-2 border rounded-md font-geist bg-white"
                          >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="E">E</option>
                          <option value="F">F</option>
                          <option value="G">G</option>
                          <option value="H">H</option>
                          <option value="I">I</option>
                          <option value="J">J</option>
                        </select>
                        {errors.section && <span className="text-red-500 text-xs">{errors.section.message}</span>}
                      </div>
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