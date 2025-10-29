"use client"

import { LayoutDashboard, Users, ShoppingCart, Settings, HelpCircle, Building2, Trophy, Gift, BarChart3, Bell, LogOut } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { NavigationProvider, useNavigation } from "@/contexts/navigation-context"
import { DashboardView } from "@/components/views/dashboard-view"
import { ClientesView } from "@/components/views/clientes-view"
import { SucursalesView } from "@/components/views/sucursales-view"
import { POSView } from "@/components/views/pos-view"
import { GiftCardsView } from "@/components/views/giftcards-view"
import { RetosView } from "@/components/views/retos-view"
import { PlaceholderView } from "@/components/views/placeholder-view"
import { SettingsModal } from "@/components/settings-modal"
import { NotificationsSheet } from "@/components/notifications-sheet"
import { signOut } from "@/lib/supabase/auth"
import { useRouter } from "next/navigation"
import { useState } from "react"

function AdminContent() {
  const { currentView, setView } = useNavigation()
  const router = useRouter()
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/ingreso")
      router.refresh()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView />
      case "clientes":
        return <ClientesView />
      case "sucursales":
        return <SucursalesView />
      case "pos":
        return <POSView />
      case "retos":
        return <RetosView />
      case "giftcards":
        return <GiftCardsView />
      case "analytics":
        return <PlaceholderView title="Analytics" description="Análisis y estadísticas de tu negocio" icon={BarChart3} />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar izquierdo con iconos */}
      <aside className="w-20 flex flex-col items-center p-4 flex-shrink-0">
        {/* Logo en la parte superior */}
        <div className="mb-8 mt-2">
          <img
            src="https://yhfmxwleuufwueypmvgm.supabase.co/storage/v1/object/public/adminapp/PHOTO-2025-10-28-14-22-32.jpg"
            alt="Meit Logo"
            className="w-12 h-12 rounded-[50%] object-cover"
          />
        </div>

        {/* Grupo superior de navegación centrado */}
        <div className="flex-1 flex items-center">
          <div className="flex flex-col items-center gap-4 bg-card p-3 border" style={{ borderRadius: '50px', borderColor: '#eeeeee' }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setView("dashboard")}
                  className={`flex items-center justify-center w-10 h-10 transition-colors hover:bg-primary/10 [&:hover>svg]:text-primary cursor-pointer ${currentView === "dashboard" ? "bg-primary/10" : ""}`}
                  style={{ borderRadius: '50px' }}
                >
                  <LayoutDashboard className={`w-6 h-6 ${currentView === "dashboard" ? "text-primary" : ""}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Dashboard</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setView("clientes")}
                  className={`flex items-center justify-center w-10 h-10 transition-colors hover:bg-primary/10 [&:hover>svg]:text-primary cursor-pointer ${currentView === "clientes" ? "bg-primary/10" : ""}`}
                  style={{ borderRadius: '50px' }}
                >
                  <Users className={`w-6 h-6 ${currentView === "clientes" ? "text-primary" : ""}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Clientes</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setView("sucursales")}
                  className={`flex items-center justify-center w-10 h-10 transition-colors hover:bg-primary/10 [&:hover>svg]:text-primary cursor-pointer ${currentView === "sucursales" ? "bg-primary/10" : ""}`}
                  style={{ borderRadius: '50px' }}
                >
                  <Building2 className={`w-6 h-6 ${currentView === "sucursales" ? "text-primary" : ""}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Sucursales</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setView("pos")}
                  className={`flex items-center justify-center w-10 h-10 transition-colors hover:bg-primary/10 [&:hover>svg]:text-primary cursor-pointer ${currentView === "pos" ? "bg-primary/10" : ""}`}
                  style={{ borderRadius: '50px' }}
                >
                  <ShoppingCart className={`w-6 h-6 ${currentView === "pos" ? "text-primary" : ""}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Punto de Venta</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setView("retos")}
                  className={`flex items-center justify-center w-10 h-10 transition-colors hover:bg-primary/10 [&:hover>svg]:text-primary cursor-pointer ${currentView === "retos" ? "bg-primary/10" : ""}`}
                  style={{ borderRadius: '50px' }}
                >
                  <Trophy className={`w-6 h-6 ${currentView === "retos" ? "text-primary" : ""}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Retos</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setView("giftcards")}
                  className={`flex items-center justify-center w-10 h-10 transition-colors hover:bg-primary/10 [&:hover>svg]:text-primary cursor-pointer ${currentView === "giftcards" ? "bg-primary/10" : ""}`}
                  style={{ borderRadius: '50px' }}
                >
                  <Gift className={`w-6 h-6 ${currentView === "giftcards" ? "text-primary" : ""}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Gift Cards</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setView("analytics")}
                  className={`flex items-center justify-center w-10 h-10 transition-colors hover:bg-primary/10 [&:hover>svg]:text-primary cursor-pointer ${currentView === "analytics" ? "bg-primary/10" : ""}`}
                  style={{ borderRadius: '50px' }}
                >
                  <BarChart3 className={`w-6 h-6 ${currentView === "analytics" ? "text-primary" : ""}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Analytics</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Grupo inferior de perfil y ayuda */}
        <div className="flex flex-col items-center gap-4 bg-card p-3 border" style={{ borderRadius: '50px', borderColor: '#eeeeee' }}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center justify-center w-10 h-10 transition-colors hover:bg-primary/10 [&:hover>svg]:text-primary cursor-pointer"
                style={{ borderRadius: '50px' }}
              >
                <Settings className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Configuración</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex items-center justify-center w-10 h-10 transition-colors hover:bg-primary/10 [&:hover>svg]:text-primary cursor-pointer" style={{ borderRadius: '50px' }}>
                <HelpCircle className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Ayuda</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="w-10 h-10 overflow-hidden bg-gray-200 dark:bg-gray-700 cursor-pointer" style={{ borderRadius: '50px' }}>
                <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                  JD
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Perfil</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {/* Área principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar - fijo */}
        <header className="h-16 flex items-center justify-end px-6 pt-4 flex-shrink-0">
          <div className="flex items-center gap-2 bg-card p-2 border" style={{ borderRadius: '50px', borderColor: '#eeeeee' }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowNotifications(true)}
                  className="flex items-center justify-center w-10 h-10 transition-colors hover:bg-primary/10 [&:hover>svg]:text-primary relative cursor-pointer"
                  style={{ borderRadius: '50px' }}
                >
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Notificaciones</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center w-10 h-10 transition-colors hover:bg-primary/10 [&:hover>svg]:text-primary cursor-pointer"
                  style={{ borderRadius: '50px' }}
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Cerrar sesión</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Contenido principal con scroll */}
        <div className="flex-1 overflow-y-auto px-6">
          {renderView()}
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
      />

      {/* Notifications Sheet */}
      <NotificationsSheet
        open={showNotifications}
        onOpenChange={setShowNotifications}
      />
    </div>
  )
}

export default function AdminPage() {
  return (
    <NavigationProvider>
      <AdminContent />
    </NavigationProvider>
  )
}
