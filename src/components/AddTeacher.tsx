import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import MultiSelectAddTeacher from './MultiSelectAddTeacher';

interface AddTeacherProps {
  fetch: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const FormSchema = z.object({
  teacher_id: z.string().min(10, { message: 'ID must have at least 10 characters' }),
  teacher_email: z.string().email({ message: "Invalid email address" }).min(1, { message: "Email is required" }),
  lastname: z.string().min(1, { message: 'Last Name is required' }),
  firstname: z.string().min(1, { message: 'First Name is required' }),
  courses: z.array(z.string()).min(1, { message: 'At least one course is required' }),
  sections: z.array(z.string()).min(1, { message: 'At least one section is required' }),
  subjects: z.array(z.string()).min(1, { message: 'At least one subject is required' }),
});

type FormData = z.infer<typeof FormSchema>;

export const AddTeacher = ({ open, setOpen, fetch }: AddTeacherProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      courses: [],
      sections: [],
      subjects: [],
    },
  });

  const [userExists, setUserExists] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Generate all possible sections (1A, 1B, ..., 4J)
  const allSections = Array.from({ length: 4 }, (_, year) =>
    Array.from({ length: 10 }, (_, section) => `${year + 1}${String.fromCharCode(65 + section)}`)
  ).flat();

  const [courses, setCourses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
 
  const fetchCourses = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/acads/getCourses");
      const courseNames = response.data.map((course: { course: string }) => course.course);
      setCourses(courseNames);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/acads/getSubjects");
      const subjectNames = response.data.map((subject: { subject: string }) => subject.subject);
      setSubjects(subjectNames);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects");
    }
  }

  useEffect(() => {
    fetchCourses();
    fetchSubjects();
  }, []);

  const addNewTeacher = async (data: FormData) => {
    setLoading(true);
    const newTeacher = {
      teacher_id: data.teacher_id,
      lastname: data.lastname,
      firstname: data.firstname,
      courses: data.courses,
      sections: data.sections,
      subjects: data.subjects,
      teacher_email: data.teacher_email
    };
    const teacherEmail = {teacher_id: data.teacher_id, teacher_email: data.teacher_email, firstname: data.firstname, lastname: data.lastname}
    try {
      const response = await axios.post('https://comlab-backend.vercel.app/api/teacher/addTeacher', newTeacher);
      console.log(response.data);

      const sendQr = await axios.post("https://comlab-backend.vercel.app/api/teacher/teacherQR",teacherEmail)
      console.log("Sent successfully", sendQr.data);

      setOpen(false);
      toast.success('Teacher has been created.');
      setLoading(false);
      fetch();
      reset({
        teacher_id: '',
        lastname: '',
        firstname: '',
        courses: [],
        sections: [],
        subjects: [],
        teacher_email: '',
      });
    } catch (error: any) {
      console.error('Error adding teacher', error);
      if (error.response && error.response.status === 403) {
        setUserExists(true);
        toast.error('Teacher ID already exists');
        setLoading(false);
      } else {
        toast.error('Failed to add teacher');
        setOpen(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <Plus strokeWidth={3} /> Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] font-geist">
        <DialogHeader>
          <DialogTitle>Add Teacher</DialogTitle>
          <DialogDescription>Click submit when you're done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Teacher ID */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">ID</Label>
            <div className="col-span-3 relative">
              <Input id="id" {...register('teacher_id')} placeholder="########" />
              {errors.teacher_id && <span className="text-red-500 text-xs font-geist">{errors.teacher_id.message}</span>}
            </div>
          </div>

          {/* Teacher Email */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="teacher_email" className="text-right">Email</Label>
            <div className="col-span-3 relative">
              <Input id="teacher_email" {...register('teacher_email')} placeholder="Email" />
              {errors.teacher_email && <span className="text-red-500 text-xs font-geist">{errors.teacher_email.message}</span>}
            </div>
          </div>

          {/* Last Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastname" className="text-right">Last Name</Label>
            <div className="col-span-3 relative">
              <Input id="lastname" {...register('lastname')} placeholder="Last Name" />
              {errors.lastname && <span className="text-red-500 text-xs font-geist">{errors.lastname.message}</span>}
            </div>
          </div>

          {/* First Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstname" className="text-right">First Name</Label>
            <div className="col-span-3 relative">
              <Input id="firstname" {...register('firstname')} placeholder="First Name" />
              {errors.firstname && <span className="text-red-500 text-xs font-geist">{errors.firstname.message}</span>}
            </div>
          </div>

          {/* Subjects */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subjects" className="text-right">Subjects</Label>
            <div className="col-span-3 relative">
              <MultiSelectAddTeacher
                options={subjects}
                onChange={(selectedOptions) => setValue('subjects', selectedOptions)}
              />
              {errors.subjects && <p className="text-red-500 text-xs">{errors.subjects.message}</p>}
            </div>
          </div>

          {/* Courses */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="courses" className="text-right">Courses</Label>
            <div className="col-span-3 relative">
              <MultiSelectAddTeacher
                options={courses}
                onChange={(selectedOptions) => setValue('courses', selectedOptions)}
              />
              {errors.courses && <p className="text-red-500 text-xs">{errors.courses.message}</p>}
            </div>
          </div>

          {/* Sections */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sections" className="text-right">Sections</Label>
            <div className="col-span-3 relative">
              <MultiSelectAddTeacher
                options={allSections}
                onChange={(selectedOptions) => setValue('sections', selectedOptions)}
              />
              {errors.sections && <p className="text-red-500 text-xs">{errors.sections.message}</p>}
            </div>
          </div>
        </div>
        <DialogFooter className="flex items-center">
          {userExists && <span className="text-red-500 text-xs font-geist">Teacher already exists. Please choose a different account ID.</span>}
          <Button onClick={handleSubmit(addNewTeacher)}>
            {loading ? (
              <>
                Submitting
                <Loader2 className="animate-spin" />
              </>
            ) : (
              <>Submit</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};