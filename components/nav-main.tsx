"use client"

import { PlusCircle, Mail, type LucideIcon } from "lucide-react"
import { useNavigation } from "@/contexts/navigation-context"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type View = "dashboard" | "clientes" | "sucursales" | "pos" | "retos" | "giftcards" | "analytics"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    view: View
    icon?: LucideIcon
  }[]
}) {
  const { currentView, setView } = useNavigation()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Crear Rápido"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <PlusCircle />
              <span>Crear Rápido</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <Mail />
              <span className="sr-only">Bandeja</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = currentView === item.view
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  onClick={() => setView(item.view)}
                  className="data-[active=true]:text-primary data-[active=true]:bg-primary/10 hover:text-primary hover:bg-primary/10 [&>svg]:data-[active=true]:text-primary [&>svg]:hover:text-primary cursor-pointer"
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
