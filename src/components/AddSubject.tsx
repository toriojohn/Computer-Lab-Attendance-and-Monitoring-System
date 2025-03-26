
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
import { useState } from "react"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import axios from 'axios'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'

interface AddSubjectProps {
  fetch: () => void;
  open: boolean;
  setOpen: (open: boolean) => void; // Corrected type for setOpen
}

const FormSchema = z.object({
  subject_code: z.string().min(1, {message: "Subject Code is required"}),
  subject: z.string().min(1, {message: "Subject name is required"}),
})

type FormData = z.infer<typeof FormSchema>;

export const AddSubject = ({open, setOpen, fetch} : AddSubjectProps) => {
  const { register, handleSubmit, formState: {errors} } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })
  const [loading, setLoading] = useState(false);


  const addNewSubject = async (data: FormData) => {
    setLoading(true);
    const newSubject = {subject_code: data.subject_code, subject: data.subject}
    try {
      const response = await axios.post("https://comlab-backend.vercel.app/api/acads/addSubject", newSubject);
      console.log(response.data)
      setOpen(false);
      toast.success("New Data has been created.")
      setLoading(false);
      fetch();
    } catch (error) {
      console.error("Error adding data", error)
      setOpen(false);
    }
    
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}><Plus strokeWidth={3}/>Add</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] font-geist">
        <DialogHeader>
          <DialogTitle>Add</DialogTitle>
          <DialogDescription>
          Click submit when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject_code" className="text-right">
              Subject Code
            </Label>
            <div className="col-span-3 relative">
              <Input 
                id="subject_code" 
                className="col-span-3" 
                type="text"
                {...register("subject_code")}
                placeholder="Code"
              />
              {errors.subject_code && <span className="text-red-500 text-xs font-geist">{errors.subject_code.message}</span>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              Name
            </Label>
            <div className="col-span-3 relative">
              <Input 
                id="subject" 
                className="col-span-3" 
                type="text"
                {...register("subject")}
                placeholder="Name"
              />
              {errors.subject && <span className="text-red-500 text-xs font-geist">{errors.subject.message}</span>}
            </div>
          </div>
        </div>
        <DialogFooter className="flex items-center">
          <Button onClick={handleSubmit(addNewSubject)}> 
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
