import * as React from "react"
import { ChevronDown, ChevronUp, SquareTerminal } from "lucide-react"

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
  navMain: [
    {
      title: "Overview",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "Attendance Record",
          url: "/teacher/Record",
          isActive: false,
        },
        {
          title: "Schedule",
          url: "/teacher/schedule",
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

export function AppSidebarTeacher({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                  <span className="text-white">v1.0.0</span>
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
