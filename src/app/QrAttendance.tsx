import { QRAttendanceTable } from '@/components/tables/QRAttendanceTable';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Scanner } from '@yudiel/react-qr-scanner';
import { useEffect, useState } from 'react';
import axios from 'axios';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export const QrAttendance = () => {
  const navigate = useNavigate();

  // State variables
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [isStartClick, setIsStartClick] = useState<boolean>(false);
  const [isScanned, setIsScanned] = useState<boolean>(false);
  const [course, setCourse] = useState<string>('')
  const [section, setSection] = useState<string>('')
  const [subject, setSubject] = useState<string>('')
  const [comlab, setComLab] = useState<string>('')


  const [teacher, setTeacher] = useState<any>(null);
  const [teacherName, setTeacherName] = useState<string>('');
  const [teacherId, setTeacherId] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [classStarted, setClassStarted] = useState<boolean>(false);
  const [isEndClassEnabled, setIsEndClassEnabled] = useState<boolean>(false);
  const [endClassLoading, setEndClassLoading] = useState(false);
  const [startClassLoading, setStartClassLoading] = useState(false);

  const [refresh, setRefresh] = useState<number>(0);

  // Time formatting function
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Handler for start time
  // const handleStartTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setStartTime(event.target.value);
  // };

  // Handler for end time
  const handleEndTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(event.target.value);
  };

  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [loginDisabled, setLoginDisabled] = useState(false);

  // const formatEndTime = (date: Date): string => {
  //   const hours = date.getHours().toString().padStart(2, '0');
  //   const minutes = date.getMinutes().toString().padStart(2, '0');
  //   return `${hours}:${minutes}`;
  // };

  const fetchTeacher = async (result: any) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://comlab-backend.vercel.app/api/teacher/getSpecificTeacher/${result}`);
      const teacherData = response.data.teacher;
      setTeacher(teacherData);
      setTeacherName(`${teacherData.lastname}, ${teacherData.firstname}`);
      setTeacherId(teacherData.teacher_id);
      setLoading(false)
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        toast.error("Teacher do not exists.");
        setLoading(false);
        setIsStartClick(false);
        setIsScanned(false);
      }
      else {
        toast.error("An unknown error has occurred.");
        setLoading(false);
        setIsStartClick(false);
        setIsScanned(false);
      }
    }
  };

  // Handle QR code scan
  const handleScan = async (result: any) => {
    const res = result.map((v: any) => v.rawValue.toString());
    console.log(res.toString());
    console.log(teacherId)
    console.log(course)
    console.log(section)
    try {
      const data = {
        student_id: res.toString(),
        // teacher_id: teacherId, //teacher
        // course: course, //teacher
        // section: section, //teacher
        in_time: startTime,
        out_time: endTime
      };
      const response = await axios.post('https://comlab-backend.vercel.app/api/student/updateAttendance', data);
      console.log(response);
      toast.error("Attendance recorded");
      setRefresh(prev => prev += 1);
    } catch (error: any) {
      if (error.message.includes("402")) {
        toast.error("Cannot time out before the end time.");
        setLoading(false);
      } else if (error.message.includes("403")) {
        toast.error("You cannot enter this class now.");
        setLoading(false);
      } else if (error.message.includes("404")) {
        toast.error("Student not found or failed to update.");
        setLoading(false);
      } else if (error.message.includes("405")) {
        toast.error("Failed to update in-time.");
        setLoading(false);
      } else if (error.message.includes("406")) {
          toast.error("Cannot time in now.");
          setLoading(false);
      }else {
        toast.error("An unknown error has occurred.");
        setLoading(false);
      }
    }
  };

  const handleConfirm = async () => {
    setStartClassLoading(true);
    const newData = {teacher_id: teacherId, course: course, section: section, subject: subject}
    const teacherAttendance = {teacher_id: teacherId, course: course, section: section, subject: subject, time_in: startTime, unique: randomCode, comlab: comlab}
    try {
      await axios.delete("https://comlab-backend.vercel.app/api/student/deleteAllStudentAttendance")
      await axios.post("https://comlab-backend.vercel.app/api/teacher/addToAttendance", teacherAttendance)
      toast.success("Class is starting! Scan your QR code to mark attendance.");

      await axios.post("https://comlab-backend.vercel.app/api/student/addToClass", newData)
      setRefresh(prev => prev += 1);
      console.log(newData)
    } catch (error) {
      console.error(error)
      setStartClassLoading(false);
    }

    setLoginDisabled(true);
    setClassStarted(true);
    setIsStartClick(false);
    setIsPaused(false);
    setIsScanned(false);
    setStartClassLoading(false);
  };

  const handleEndClass = async () => {
    setEndClassLoading(true);
    const teacherData = {unique: randomCode, time_out: endTime}
    try {
      await axios.post("https://comlab-backend.vercel.app/api/student/transferToRecords")
      await axios.post("https://comlab-backend.vercel.app/api/teacher/updateAttendance", teacherData)
      await axios.delete("https://comlab-backend.vercel.app/api/student/deleteAllStudentAttendance")
      setEndClassLoading(false);

      toast.success("Classes ended successfully. Attendance records have been transferred.")
      setRefresh(prev => prev += 1);
      setClassStarted(false);
      setIsEndClassEnabled(false);
      setIsPaused(true);
      setLoginDisabled(false);
      setIsScanned(false);
      window.location.reload();
    } catch (error) {
      console.error(error)
      setEndClassLoading(false);
    }
  };

  // Function to check if the current time is past the end time
  const isTimePastEndTime = () => {
    const currentTime = new Date();
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const endTimeDate = new Date();
    endTimeDate.setHours(endHours, endMinutes, 0, 0);

    return currentTime >= endTimeDate;
  };

  useEffect(() => {
    if (!classStarted || !endTime) return;
    let timeoutId: NodeJS.Timeout;
    const checkTime = () => {
      if (isTimePastEndTime()) {
        setIsEndClassEnabled(true);
      } else {
        timeoutId = setTimeout(checkTime, 10000);
      }
    };

    checkTime();

    return () => clearTimeout(timeoutId);
  }, [classStarted, endTime]);

  const [randomCode, setRandomCode] = useState<string>('');
  const generateUniqueRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    return code;
  };
  useEffect(() => {
    setRandomCode(generateUniqueRandomCode());
  }, []);

  return (
    <>
      <Toaster />
      <div className="h-screen">
        <div className="h-full flex justify-center">
          <Button className="absolute left-5 top-5" onClick={() => navigate("/login")} disabled={loginDisabled}>Login</Button>
          <div className="w-[60%] h-full flex justify-center items-center bg-[#18181b] border-r border-gray-200">
            <div className="w-[500px] absolute top-28">
              <Scanner onScan={handleScan} paused={isPaused} allowMultiple={true} scanDelay={1500}/>
            </div>
          </div>
          <div className="w-full h-[90%] p-4 flex flex-col items-center">
            <QRAttendanceTable refreshKey={refresh} />
            {!classStarted && (
              <Button onClick={() => { setIsScanned(false); setIsStartClick(true); setStartTime(formatTime(new Date()));}} className='w-[20%] bg-[#022c22] hover:bg-[#064e3b]'>Create New Class</Button>
            )}

            {classStarted && (
              <div className="mt-4 text-center flex flex-col gap-4 items-center bg-green-100 w-[50%] py-8 rounded-md">
                <span className="text-sm text-gray-600">
                  Start Time: <strong className={`${isEndClassEnabled === true ? 'text-green-700' : 'text-yellow-700'}`}>{startTime}</strong> | 
                  End Time: <strong className={`${isEndClassEnabled === true ? 'text-green-700' : 'text-yellow-700'}`}>{endTime}</strong>
                </span>
                <div className={`flex flex-col ${isEndClassEnabled === true ? 'text-green-700' : 'text-yellow-700'} text-sm`}>
                  <strong>{teacherName}</strong>
                  <span className="text-gray-500">Teacher</span>
                </div>
                <div className='mt-8 w-full'>
                  {classStarted && (
                    <div className='flex flex-col gap-2 items-center'>
                      <Button onClick={handleEndClass} disabled={!isEndClassEnabled} className='w-[40%] bg-green-600 hover:bg-green-700 text-white'>
                        End Class
                        {endClassLoading &&
                          <Loader2 className='animate-spin mx-2'/>
                        }
                      </Button>
                      <span className={`${isEndClassEnabled === true ? 'text-green-700' : 'text-yellow-700'} text-xs`}>
                        {`${isEndClassEnabled === true ? 'Class ended' : 'Class can only be ended after the scheduled end time'}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

            )}
            <Dialog open={isStartClick} onOpenChange={() => setIsStartClick(false)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className='text-center'>Set up class attendance</DialogTitle>
                  <div className={`w-full bg-red-200 ${isScanned ? 'hidden' : 'flex'}`}>
                    <Scanner onScan={(teacherResult) => { setIsScanned(true); fetchTeacher(teacherResult.map((v: any) => v.rawValue).toString()); }} paused={false}/>
                  </div>
                  <div className={`w-full ${isScanned ? 'flex' : 'hidden'}`}>
                    {loading ? (
                      <div className="flex justify-center items-center">
                        <Loader2 className='animate-spin text-center' />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-5 w-full">
                        <div className="flex flex-col gap-3">
                          <div>
                            <Label htmlFor="teacher_id">ID</Label>
                            <Input id="teacher_id" placeholder="Teacher ID" value={teacherId} disabled />
                          </div>
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="Teacher Name" value={teacherName} disabled />
                          </div>
                          <div className='flex flex-col gap-2'>
                            <Label htmlFor="subject">Subject</Label>
                            <Select value={subject} onValueChange={setSubject}>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a course" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Subjects</SelectLabel>
                                  {teacher?.subjects?.map((subject: string, index: number) => (
                                    <SelectItem key={index} value={subject}>{subject}</SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className='flex flex-col gap-2'>
                            <Label htmlFor="course">Course</Label>
                            <Select value={course} onValueChange={setCourse}>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a course" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Courses</SelectLabel>
                                  {teacher?.courses?.map((course: string, index: number) => (
                                    <SelectItem key={index} value={course}>{course}</SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className='flex flex-col gap-2'>
                            <Label htmlFor="section">Section</Label>
                            <Select value={section} onValueChange={setSection}>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a section" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Sections</SelectLabel>
                                  {teacher?.sections?.map((section: string, index: number) => (
                                    <SelectItem key={index} value={section}>{section}</SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className='flex flex-col gap-2'>
                            <Label htmlFor="section">Com Lab</Label>
                            <Select value={comlab} onValueChange={setComLab}>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a lab" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Com Lab</SelectLabel>
                                  <SelectItem value='1'>1</SelectItem>
                                  <SelectItem value='2'>2</SelectItem>
                                  <SelectItem value='3'>3</SelectItem>
                                  <SelectItem value='4'>4</SelectItem>
                                  <SelectItem value='5'>5</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-col">
                            <label htmlFor="time" className="text-sm font-medium mb-2">Select Time:</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                id="startTime"
                                value={startTime}
                                className="border p-2 rounded-md bg-white"
                                disabled
                              />
                              to
                              <input
                                type="time"
                                id="endTime"
                                value={endTime}
                                onChange={handleEndTimeChange}
                                className="border p-2 rounded-md bg-white"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="w-full flex justify-end gap-2">
                          <Button type="button" onClick={() => { setIsStartClick(false); setIsScanned(false); }} className='bg-[#022c22] hover:bg-[#064e3b]'>Cancel</Button>
                          <Button onClick={handleConfirm} className='bg-[#022c22] hover:bg-[#064e3b]'>
                            {startClassLoading ? (
                              <div className='flex gap-2'>
                                <span>Starting</span>
                                <Loader2 className='animate-spin'></Loader2>
                              </div>
                            ):(
                              <>Start Class</>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
    
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
};