import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './auth/Login'
import { QrAttendance } from './QrAttendance'
import Subjects from './admin/Subjects'
import Faculty from './admin/Faculty'
import CourseAndSection from './admin/CourseAndSection'
import ComputerManagement from './admin/ComputerManagement'
import CMDetails from './admin/CMDetails'
import AdminRecords from './admin/AdminRecords'
import Record from './teacher/Record'
import Schedule from './teacher/Schedule'
import { Toaster } from '@/components/ui/sonner'
import AdminSched from './admin/AdminSched'
import AdminTeacherRecords from './admin/AdminTeacherRecord'
import Dashboard from './admin/Dashboard'
import Courses from './admin/Courses'

function App() {
  return (
    <BrowserRouter>
     <Toaster />
        <Routes>
          <Route path={'/'} element={<QrAttendance />}/>
          <Route path={'/login'} element={<Login />}/>
          <Route path={'/admin/course&section'} element={<CourseAndSection />}/>
          <Route path={'/admin/subjects'} element={<Subjects />}/>
          <Route path={'/admin/courses'} element={<Courses />}/>
          <Route path={'/admin/faculty'} element={<Faculty />}/>
          <Route path={'/admin/computermanagement'} element={<ComputerManagement />}/>
          <Route path={'/admin/computermanagement/:name'} element={<CMDetails />}/>
          <Route path={'/admin/attendanceRecord/studentsRecord'} element={<AdminRecords />}/>
          <Route path={'/admin/dashboard'} element={<Dashboard />}/>
          <Route path={'/admin/attendanceRecord/teachersRecord'} element={<AdminTeacherRecords />}/>
          <Route path={'/admin/schedule'} element={<AdminSched />}/>
          <Route path={'/teacher/Record'} element={<Record />}/>
          <Route path={'/teacher/schedule'} element={<Schedule />}/>
          {/* <Route path={'/admin/accounts'} element={<Users />}/> */}
        </Routes>
    </BrowserRouter>
  )
}

export default App
