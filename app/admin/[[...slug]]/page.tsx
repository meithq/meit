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
import { useState, useEffect } from "react"
import { getUnreadCount, subscribeToNotifications } from "@/lib/supabase/notifications"
import { getBusinessSettings } from "@/lib/supabase/business-settings"

function AdminContent() {
  const { currentView, setView } = useNavigation()
  const router = useRouter()
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayView, setDisplayView] = useState(currentView)
  const [unreadCount, setUnreadCount] = useState(0)

  // Cargar contador de notificaciones no leídas
  useEffect(() => {
    loadUnreadCount()

    // Suscripción en tiempo real
    const setupSubscription = async () => {
      const settings = await getBusinessSettings()
      if (!settings?.id) return

      console.log('🔌 Setting up AdminPage realtime subscription...')

      return subscribeToNotifications(settings.id, (payload) => {
        console.log('🔔 AdminPage received notification change:', payload)

        // Reproducir sonido solo cuando es una nueva notificación (INSERT)
        if (payload.eventType === 'INSERT') {
          playNotificationSound()
        }

        loadUnreadCount()
      })
    }

    const unsubscribePromise = setupSubscription()

    return () => {
      console.log('🔌 Cleaning up AdminPage subscription')
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe()
      })
    }
  }, [])

  const loadUnreadCount = async () => {
    try {
      const settings = await getBusinessSettings()
      if (!settings?.id) return

      const count = await getUnreadCount(settings.id)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  // Función para reproducir sonido de notificación
  const playNotificationSound = () => {
    try {
      // Usar la API de Web Audio para generar un sonido suave
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Crear oscilador para el tono
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Configurar un sonido suave y agradable (like iOS)
      oscillator.frequency.value = 800 // Frecuencia en Hz
      oscillator.type = 'sine' // Onda sinusoidal (más suave)

      // Envelope para hacer el sonido más suave
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      // Reproducir
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
  }

  // Recargar contador cuando se cierra el sheet de notificaciones
  useEffect(() => {
    if (!showNotifications) {
      loadUnreadCount()
    }
  }, [showNotifications])

  // Manejar transiciones suaves entre vistas
  useEffect(() => {
    if (currentView !== displayView) {
      // Fade out
      setIsTransitioning(true)

      // Después de fade out, cambiar vista y hacer fade in
      const timer = setTimeout(() => {
        setDisplayView(currentView)
        setIsTransitioning(false)
      }, 150) // Duración del fade out

      return () => clearTimeout(timer)
    }
  }, [currentView, displayView])

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
    const views = {
      dashboard: <DashboardView />,
      clientes: <ClientesView />,
      sucursales: <SucursalesView />,
      pos: <POSView />,
      retos: <RetosView />,
      giftcards: <GiftCardsView />,
      analytics: <PlaceholderView title="Analytics" description="Análisis y estadísticas de tu negocio" icon={BarChart3} />
    }

    return views[displayView as keyof typeof views] || views.dashboard
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
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center font-semibold px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Notificaciones {unreadCount > 0 && `(${unreadCount})`}</p>
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
        <div className="flex-1 overflow-y-auto px-6 relative">
          <div
            className={`w-full transition-all duration-300 ease-in-out ${
              isTransitioning
                ? 'opacity-0 translate-y-2'
                : 'opacity-100 translate-y-0'
            }`}
          >
            {renderView()}
          </div>
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
