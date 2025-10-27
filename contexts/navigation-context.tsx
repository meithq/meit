"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

type View = "dashboard" | "clientes" | "sucursales" | "pos" | "retos" | "giftcards" | "analytics"

interface NavigationContextType {
  currentView: View
  setView: (view: View) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const router = useRouter()
  const pathname = usePathname()

  // Sincronizar vista con URL al cargar
  useEffect(() => {
    const viewFromPath = getViewFromPath(pathname)
    if (viewFromPath) {
      setCurrentView(viewFromPath)
    }
  }, [pathname])

  const setView = (view: View) => {
    setCurrentView(view)
    // Actualizar URL sin recargar la página
    const url = getUrlFromView(view)
    router.push(url, { scroll: false })
  }

  return (
    <NavigationContext.Provider value={{ currentView, setView }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}

// Mapear path a view
function getViewFromPath(path: string): View | null {
  if (path === "/admin" || path === "/admin/") return "dashboard"
  if (path.startsWith("/admin/clientes")) return "clientes"
  if (path.startsWith("/admin/sucursales")) return "sucursales"
  if (path.startsWith("/admin/pos")) return "pos"
  if (path.startsWith("/admin/retos")) return "retos"
  if (path.startsWith("/admin/giftcards")) return "giftcards"
  if (path.startsWith("/admin/analytics")) return "analytics"
  return null
}

// Mapear view a URL
function getUrlFromView(view: View): string {
  switch (view) {
    case "dashboard":
      return "/admin"
    case "clientes":
      return "/admin/clientes"
    case "sucursales":
      return "/admin/sucursales"
    case "pos":
      return "/admin/pos"
    case "retos":
      return "/admin/retos"
    case "giftcards":
      return "/admin/giftcards"
    case "analytics":
      return "/admin/analytics"
    default:
      return "/admin"
  }
}
