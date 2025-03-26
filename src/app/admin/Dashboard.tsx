import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SchedulerComponent } from "@/components/SchedulerComponent"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import axios from "axios"
import { Boxes, TrendingUpIcon } from "lucide-react"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const [totalStudents, setTotalStudents] = useState("");
  const [totalTeachers, setTotalTeachers] = useState("");
  const [totalComputerSets, setTotalComputerSets] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const responseStudents = await axios.get("https://comlab-backend.vercel.app/api/student/getStudents");
        setTotalStudents(responseStudents.data.length)

        const responseTeachers = await axios.get("https://comlab-backend.vercel.app/api/teacher/getTeachers");
        setTotalTeachers(responseTeachers.data.length)

        const responseComputer= await axios.get("https://comlab-backend.vercel.app/api/computerStat/getList");
        setTotalComputerSets(responseComputer.data.com.length)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching students", error)
      }
    }
    fetchData();
  }, [])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        {loading ? (
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
          </div>
        ):(
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <Card className="@container/card">
                <CardHeader className="relative">
                  <CardDescription>Total Students</CardDescription>
                  <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">{totalStudents || "0"}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                  <div className="line-clamp-1 flex gap-2 font-medium">
                    Student Enrolled. <TrendingUpIcon className="size-4" />
                  </div>
                  <div className="text-muted-foreground">
                    Showing total number of enrolled students.
                  </div>
                </CardFooter>
              </Card>
              <Card className="@container/card">
                <CardHeader className="relative">
                  <CardDescription>Total Teachers</CardDescription>
                  <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">{totalTeachers || "0"}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                  <div className="line-clamp-1 flex gap-2 font-medium">
                    Teacher Staff. <TrendingUpIcon className="size-4" />
                  </div>
                  <div className="text-muted-foreground">
                    Current total number of teachers.
                  </div>
                </CardFooter>
              </Card>
              <Card className="@container/card">
                <CardHeader className="relative">
                  <CardDescription>Total Computer Sets</CardDescription>
                  <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">{totalComputerSets || "0"}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                  <div className="line-clamp-1 flex gap-2 font-medium">
                    Computer Set Inventory. <Boxes className="size-4" />
                  </div>
                  <div className="text-muted-foreground">
                    Current total number of computer sets available.
                  </div>
                </CardFooter>
              </Card>
            </div>
            <Card className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min z-0">
              <SchedulerComponent />
            </Card>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
