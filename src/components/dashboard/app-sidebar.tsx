import * as React from "react"
import { Bot, ChevronDown, ChevronUp, SquareTerminal } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useLocation } from "react-router-dom";
import { NavUser } from "./nav-user";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Overview",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
          isActive: false,
        },
      ],
    },
    {
      title: "Course & Student Management",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Course & Section",
          url: "/admin/course&section",
          isActive: false,
        },
      ],
    },
    {
      title: "Administration",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Faculty",
          url: "/admin/faculty",
          isActive: false,
        },
        {
          title: "Computer Management",
          url: "/admin/computermanagement",
          isActive: false,
        },
        {
          title: "Attendance Record",
          url: "/admin/attendanceRecord/studentsRecord",
          isActive: false,
        },
        {
          title: "Set Schedule",
          url: "/admin/schedule",
          isActive: false,
        },
      ],
    },
    {
      title: "Academics",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Courses",
          url: "/admin/courses",
          isActive: false,
        },
        {
          title: "Subjects",
          url: "/admin/subjects",
          isActive: false,
        },
      ],
    },
  ],
  navFaculty: [
    {
      title: "Faculty",
      url: "/admin/faculty",
      isActive: false,
    },
    {
      title: "Computer Management",
      url: "/admin/computermanagement",
      isActive: false,

    },
  ],
  navSettings: [
    {
      title: "Settings",
      url: "#",
      items: [
        {
          title: "Profile",
          url: "/profile",
        },
        {
          title: "Logout",
          url: "/",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();

  const updatedNav = data.navMain.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      isActive: location.pathname === item.url, // Set isActive to true if path matches
    })),
  }));
  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white">
                  <img src="/images/clm-logo.png" sizes="4"></img>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-white">Computer Lab Monitoring and Attendance System</span>
                
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarMenu>
            {updatedNav.map((item) => (
              <Collapsible
                key={item.title}
                defaultOpen
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="bg-transparent">
                      {item.title}{" "}
                      <ChevronDown className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <ChevronUp className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {item.items?.length ? (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={item.isActive}
                            >
                              <a href={item.url}>{item.title}</a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
