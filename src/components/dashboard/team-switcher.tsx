"use client"



import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function TeamSwitcher() {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
           
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight font-geist">
            <span className="truncate font-semibold">
             
            </span>
            <span className="truncate text-xs"></span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
