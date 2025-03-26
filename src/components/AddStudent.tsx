
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import axios from 'axios'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'

interface AddStudentProps {
  fetch: () => void;
  open: boolean;
  setOpen: (open: boolean) => void; // Corrected type for setOpen
}

const FormSchema = z.object({
  student_id: z.string().min(10, {message: "ID must have atleast 10 characters"}),
  email: z.string().email({ message: "Invalid email address" }).min(1, { message: "Email is required" }),
  lastname: z.string().min(1, {message: "Last Name is required"}),
  firstname: z.string().min(1, {message: "First Name is required"}),
  course: z.string().optional(),
  yearlevel: z.string().optional(),
  section: z.string().optional()
})

type FormData = z.infer<typeof FormSchema>;

export const AddStudent = ({open, setOpen, fetch} : AddStudentProps) => {
  const { register, handleSubmit, formState: {errors}, reset, watch } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })
  const [userExists, setUserExists] = useState(false);
  const [loading, setLoading] = useState(false);

  const yearLevel = watch("yearlevel");
  const section = watch("section");
  const combinedSection = yearLevel && section ? `${yearLevel}${section}` : "1A";
  const [courses, setCourses] = useState<{ _id: string, course: string; course_code: string }[]>([])

  useEffect(() => {
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

  const addNewStudent = async (data: FormData) => {
    setLoading(true);
    const newStudent = {student_id: data.student_id, email: data.email, lastname: data.lastname, firstname: data.firstname, course: data.course, section: combinedSection}
    const studentEmail = {student_id: data.student_id, student_email: data.email}
    try {
      const response = await axios.post("https://comlab-backend.vercel.app/api/student/addStudent", newStudent);
      console.log(response.data)

      const sendQr = await axios.post("https://comlab-backend.vercel.app/api/student/generateQR", studentEmail)
      console.log("Sent successfully", sendQr.data);

      setOpen(false);
      toast.success("User has been created.")
      setLoading(false);
      fetch();
      reset({
        student_id: "",
        email: "",
        lastname: "",
        firstname: "",
        course: "",
        section: ""
      })
    } catch (error: any) {
      console.error("Error adding student", error)
      if (error.response && error.response.status === 403) {
        setUserExists(true);
        // Keep the dialog open to show the error
        toast.error("Student ID already exists");
        setLoading(false);
      } else {

        toast.error("Failed to add data");
        setOpen(false);
      }
    }
    
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}><Plus strokeWidth={3}/>Add</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] font-geist">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
          Click submit when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              ID
            </Label>
            <div className="col-span-3 relative">
              <Input 
                id="id" 
                className="col-span-3" 
                type="text"
                {...register("student_id")}
                placeholder="MA-########"
              />
              {errors.student_id && <span className="text-red-500 text-xs font-geist">{errors.student_id.message}</span>}
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
                type="email"
                {...register("email")}
                placeholder="Email"
              />
              {errors.email && <span className="text-red-500 text-xs font-geist">{errors.email.message}</span>}
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
                type="text"
                {...register("lastname")}
                placeholder="Last Name"
              />
              {errors.lastname && <span className="text-red-500 text-xs font-geist">{errors.lastname.message}</span>}
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
                type="text"
                {...register("firstname")}
                placeholder="First Name"
              />
              {errors.firstname && <span className="text-red-500 text-xs font-geist">{errors.firstname.message}</span>}
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
                className="w-[180px] p-2 border rounded-md font-geist bg-white"
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
            <div className='flex gap-4'>
              <div className="font-geist text-[14px]">
                <select 
                  id="yearlevel"
                  {...register("yearlevel")}
                  className="w-[130px] p-2 border rounded-md font-geist bg-white"
                >
                  <option value="" disabled>Year Level</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
                {errors.yearlevel && <p className="text-red-500 text-xs">{errors.yearlevel.message}</p>}
              </div>
              <div className="w-full font-geist text-[14px]">
                <select 
                  id="section"
                  {...register("section")}
                  className="p-2 border rounded-md font-geist bg-white"
                >
                  <option value="" disabled>Select section</option>
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
                {errors.section && <p className="text-red-500 text-xs">{errors.section.message}</p>}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex items-center">
          {userExists && <span className="text-red-500 text-xs font-geist">Student already exists. Please choose a different account ID.</span>}
          <Button onClick={handleSubmit(addNewStudent)}> 
            {loading ? ( 
              <>
                Submitting
                <Loader2 className="animate-spin"/>
              </>
            ):(
              <>
                Submit
              </>
            )} 
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
