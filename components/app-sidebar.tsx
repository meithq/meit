"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  Building2,
  ShoppingCart,
  Trophy,
  Gift,
  BarChart3,
  Settings,
  HelpCircle,
  Search,
  Zap,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "",
    email: "",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      view: "dashboard" as const,
      icon: LayoutDashboard,
    },
    {
      title: "Clientes",
      url: "/admin/clientes",
      view: "clientes" as const,
      icon: Users,
    },
    {
      title: "Sucursales",
      url: "/admin/sucursales",
      view: "sucursales" as const,
      icon: Building2,
    },
    {
      title: "Punto de Venta",
      url: "/admin/pos",
      view: "pos" as const,
      icon: ShoppingCart,
    },
    {
      title: "Retos",
      url: "/admin/retos",
      view: "retos" as const,
      icon: Trophy,
    },
    {
      title: "Gift Cards",
      url: "/admin/giftcards",
      view: "giftcards" as const,
      icon: Gift,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      view: "analytics" as const,
      icon: BarChart3,
    },
  ],
  navSecondary: [
    {
      title: "Configuración",
      url: "#",
      icon: Settings,
    },
    {
      title: "Ayuda",
      url: "#",
      icon: HelpCircle,
    },
    {
      title: "Buscar",
      url: "#",
      icon: Search,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#" className="flex items-center gap-3">
                <img
                  src="https://yhfmxwleuufwueypmvgm.supabase.co/storage/v1/object/public/adminapp/PHOTO-2025-10-28-14-22-32.jpg"
                  alt="Meit Logo"
                  className="!size-8 rounded-[50%] object-cover"
                />
                <span className="text-base font-semibold">Meit</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
