
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

interface AddComProps {
  fetch: () => void;
  open: boolean;
  setOpen: (open: boolean) => void; // Corrected type for setOpen
}

const FormSchema = z.object({
  name: z.string().min(1, {message: "Name is required"}),
  room: z.string().min(1, {message: "Room is required"}),
  computerSets: z.string().optional(),
})

type FormData = z.infer<typeof FormSchema>;

export const AddCom = ({open, setOpen, fetch} : AddComProps) => {
  const { register, handleSubmit, formState: {errors} } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })
  const [loading, setLoading] = useState(false);


  const addNewCom = async (data: FormData) => {
    setLoading(true);
    const newCom = {name: data.name, room: data.room}
    try {
      const response = await axios.post("https://comlab-backend.vercel.app/api/computer/add", newCom);
      console.log(response.data.com)
      setOpen(false);
      toast.success("New Data has been created.")
      setLoading(false);
      fetch();
    } catch (error) {
      console.error("Error adding student", error)
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
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <div className="col-span-3 relative">
              <Input 
                id="id" 
                className="col-span-3" 
                type="text"
                {...register("name")}
                placeholder="Name"
              />
              {errors.name && <span className="text-red-500 text-xs font-geist">{errors.name.message}</span>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastname" className="text-right">
              Room
            </Label>
            <div className="col-span-3 relative">
              <Input 
                id="room" 
                className="col-span-3" 
                type="text"
                {...register("room")}
                placeholder="Room"
              />
              {errors.room && <span className="text-red-500 text-xs font-geist">{errors.room.message}</span>}
            </div>
          </div>
        </div>
        <DialogFooter className="flex items-center">
          <Button onClick={handleSubmit(addNewCom)}> 
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
