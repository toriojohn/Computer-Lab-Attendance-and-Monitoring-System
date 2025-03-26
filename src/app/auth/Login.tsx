import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from 'react'
import { useNavigate } from "react-router-dom"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import axios from 'axios'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useTeacher } from '@/Context'

const FormSchema = z.object({
  id: z.string().min(1, { message: "Field is required" }),
  password: z.string().min(1, { message: "Password is required" }),
})

type FormData = z.infer<typeof FormSchema>

const Login = () => {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({ resolver: zodResolver(FormSchema) })
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { setTeacherId } = useTeacher();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    if(data.id === "admin123" && data.password === "admin123"){
      navigate("/admin/dashboard", {replace: true})
    }
    else{
      try {
        const response = await axios.post("https://comlab-backend.vercel.app/api/teacher/teacher-login", {teacher_id: data.id, password: data.password})
        if (response.status === 200){
          setTeacherId(response.data[0].teacher_id);
          navigate("/teacher/Record", {replace: true})
        }
      } catch (error) {
        setError("id", { type: "manual", message: "Invalid credentials, please try again." })
        setLoading(false);
      }
    }
  }

  return (
    <div className='h-screen flex items-center justify-center relative'>
      <div className='absolute z-0 flex items-center justify-center opacity-10 top-0 h-full'>
        <img src='/images/clm-logo.png' className='object-contain h-[900px] w-[900px]'></img>
      </div>
      <Card  className='bg-white z-10'>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">Welcome</CardTitle>
          <CardDescription>Enter your ID and password to log in to your account</CardDescription>
        </CardHeader>
        <CardContent className='bg-white'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="relative">
                <Label htmlFor="id" className="text-right">ID</Label>
                <Input id="id" className="w-full" type="text" {...register("id")} placeholder="ID" />
                {errors.id && <span className="text-red-500 text-xs font-geist">{errors.id.message}</span>}
              </div>
              <div className="relative">
                <Label htmlFor="password" className="text-right">Password</Label>
                <Input id="password" className="w-full" type="password" {...register("password")} placeholder="Password" />
                {errors.password && <span className="text-red-500 text-xs font-geist">{errors.password.message}</span>}
              </div>
              <Button type="submit" className="w-full bg-[#022c22] hover:bg-[#064e3b]">
                {loading ? (
                  <Loader2 className='animate-spin'/>
                ):(
                  <>Login</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
