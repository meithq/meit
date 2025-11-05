"use client"

import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { SecondaryButton } from "@/components/ui/secondary-button"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, Check, Trash2, X } from "lucide-react"
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  subscribeToNotifications
} from "@/lib/supabase/notifications"
import { getBusinessSettings } from "@/lib/supabase/business-settings"
import { NOTIFICATION_CONFIG, type Notification } from "@/lib/types/notifications"
import { toast } from "sonner"

interface NotificationsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationsSheet({ open, onOpenChange }: NotificationsSheetProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [dismissingIds, setDismissingIds] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread')
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false)

  useEffect(() => {
    if (open) {
      loadNotifications()
    }
  }, [open, activeTab])

  // Suscripción en tiempo real
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const setupSubscription = async () => {
      const settings = await getBusinessSettings()
      if (!settings?.id) return

      console.log('🔌 Setting up NotificationsSheet realtime subscription...')

      unsubscribe = subscribeToNotifications(settings.id, (payload) => {
        console.log('🔔 NotificationsSheet received notification change:', payload)
        // No mostrar loader en actualizaciones en tiempo real
        loadNotifications(false)
      })
    }

    setupSubscription()

    return () => {
      if (unsubscribe) {
        console.log('🔌 Cleaning up NotificationsSheet subscription')
        unsubscribe()
      }
    }
  }, [])

  const loadNotifications = async (showLoader = true) => {
    try {
      if (showLoader) {
        setIsLoading(true)
      }
      const settings = await getBusinessSettings()

      if (!settings?.id) {
        toast.error('No se encontró configuración del negocio')
        return
      }

      // Filtrar por estado de lectura según la pestaña activa
      const data = await getNotifications(settings.id, {
        limit: 50,
        onlyUnread: activeTab === 'unread',
        onlyRead: activeTab === 'read'
      })
      setNotifications(data)

      const count = await getUnreadCount(settings.id)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading notifications:', error)
      toast.error('Error al cargar notificaciones')
    } finally {
      if (showLoader) {
        setIsLoading(false)
      }
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      await loadNotifications(false)
    } catch (error) {
      console.error('Error marking as read:', error)
      toast.error('Error al marcar como leída')
    }
  }

  const handleMarkAllAsRead = async () => {
    if (isMarkingAllAsRead) return // Prevenir múltiples clicks

    try {
      setIsMarkingAllAsRead(true)
      const settings = await getBusinessSettings()
      if (!settings?.id) return

      const count = await markAllNotificationsAsRead(settings.id)
      await loadNotifications(false)
      toast.success(`${count} notificaciones marcadas como leídas`)
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Error al marcar todas como leídas')
    } finally {
      setIsMarkingAllAsRead(false)
    }
  }

  const handleDelete = async (notificationId: string) => {
    // Agregar el ID a la lista de notificaciones que se están descartando
    setDismissingIds(prev => [...prev, notificationId])

    // Después de la animación (300ms), eliminar de la DB
    setTimeout(async () => {
      try {
        await deleteNotification(notificationId)
        await loadNotifications()
        setDismissingIds(prev => prev.filter(id => id !== notificationId))
      } catch (error) {
        console.error('Error deleting notification:', error)
        toast.error('Error al eliminar notificación')
        setDismissingIds(prev => prev.filter(id => id !== notificationId))
      }
    }, 300)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `Hace ${diffMins}m`
    if (diffHours < 24) return `Hace ${diffHours}h`
    return `Hace ${diffDays}d`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const notificationDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (notificationDate.getTime() === today.getTime()) {
      return "Hoy"
    } else if (notificationDate.getTime() === yesterday.getTime()) {
      return "Ayer"
    } else {
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      return `${days[date.getDay()]} ${String(date.getDate()).padStart(2, '0')} de ${months[date.getMonth()]}`
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  // Agrupar notificaciones por fecha
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const dateKey = formatDate(notification.created_at)
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(notification)
    return groups
  }, {} as Record<string, Notification[]>)

  // Ordenar las fechas (Hoy, Ayer, luego otras fechas)
  const sortedDateKeys = Object.keys(groupedNotifications).sort((a, b) => {
    if (a === "Hoy") return -1
    if (b === "Hoy") return 1
    if (a === "Ayer") return -1
    if (b === "Ayer") return 1
    return 0
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="m-4 h-[calc(100vh-2rem)] p-0 [&>button]:bg-white [&>button]:rounded-full [&>button]:w-10 [&>button]:h-10 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:border [&>button]:shadow-sm [&>button]:cursor-pointer flex flex-col"
        style={{ borderRadius: '30px', borderColor: '#eeeeee' }}
      >
        <SheetHeader className="pr-16 px-6 pt-6 pb-4 flex-shrink-0">
          <SheetTitle className="text-2xl flex items-center gap-2">
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="default">
                {unreadCount} nuevas
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Mantente al tanto de todas las actividades importantes
          </SheetDescription>
        </SheetHeader>

        {/* Tabs para filtrar notificaciones */}
        <div className="px-6 pb-4 flex-shrink-0">
          <div className="relative flex gap-1 bg-[#f0f0f0] dark:bg-gray-800 p-1 rounded-full">
            {/* Selector animado */}
            <div
              className={`absolute top-1 bottom-1 bg-white dark:bg-gray-700 rounded-full shadow-sm transition-all duration-300 ease-in-out ${
                activeTab === 'unread' ? 'left-1 right-[50%]' : 'left-[50%] right-1'
              }`}
              style={{ width: 'calc(50% - 0.25rem)' }}
            />

            {/* Botones */}
            <button
              onClick={() => setActiveTab('unread')}
              className={`relative flex-1 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 cursor-pointer z-10 ${
                activeTab === 'unread'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              No leídas {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setActiveTab('read')}
              className={`relative flex-1 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 cursor-pointer z-10 ${
                activeTab === 'read'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Leídas
            </button>
          </div>
        </div>

        {/* Notifications List - scrollable */}
        <div className="flex-1 overflow-y-auto px-6 space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {/* Skeleton para grupo de notificaciones */}
              <div>
                <Skeleton className="h-4 w-16 mb-3" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="relative px-3 py-2.5 rounded-[20px] bg-white"
                    >
                      <div className="flex gap-2.5 items-start pr-6">
                        {/* Icon Skeleton */}
                        <Skeleton className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5" />

                        {/* Content Skeleton */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="w-1.5 h-1.5 rounded-full" />
                          </div>
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-2 w-16 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No tienes notificaciones
              </p>
            </div>
          ) : (
            sortedDateKeys.map((dateKey) => (
              <div key={dateKey}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {dateKey}
                </h3>
                <div className="space-y-3">
                  {groupedNotifications[dateKey].map((notification) => {
                    const config = NOTIFICATION_CONFIG[notification.type]
                    const isDismissing = dismissingIds.includes(notification.id)

                    return (
                      <div
                        key={notification.id}
                        className={`relative px-3 py-2.5 rounded-[20px] transition-all duration-300 hover:bg-primary/5 cursor-pointer group bg-white ${
                          isDismissing ? 'translate-x-[120%] opacity-0' : 'translate-x-0 opacity-100'
                        } ${notification.is_read ? 'opacity-70' : ''}`}
                        onClick={() => {
                          if (!notification.is_read) {
                            handleMarkAsRead(notification.id)
                          }
                        }}
                      >
                        {/* X button flotante - esquina superior derecha */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(notification.id)
                          }}
                          className="absolute top-2 right-2 p-1 bg-white hover:bg-muted rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow-sm"
                        >
                          <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                        </button>

                        <div className="flex gap-2.5 items-start pr-6">
                          {/* Icon - más pequeño */}
                          <div className={`w-7 h-7 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <span className="text-sm">{config.icon}</span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="font-semibold text-xs text-foreground">
                                {notification.title}
                              </h4>
                              {!notification.is_read && (
                                <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-snug">
                              {notification.message}
                            </p>

                            {/* Time - más sutil */}
                            <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer - Marcar todas como leídas (fijo al final, solo en pestaña no leídas) */}
        {!isLoading && notifications.length > 0 && unreadCount > 0 && activeTab === 'unread' && (
          <div className="flex-shrink-0 flex justify-center px-6 py-4 border-t border-border">
            <button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
              className={`text-xs font-medium px-4 py-2 bg-white rounded-full shadow-sm transition-all ${
                isMarkingAllAsRead
                  ? 'text-muted-foreground cursor-not-allowed opacity-60'
                  : 'text-primary hover:text-primary/80 hover:shadow-md hover:bg-primary/5 cursor-pointer'
              }`}
            >
              {isMarkingAllAsRead ? (
                <>
                  <div className="inline-block w-3 h-3 mr-1 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Marcando...
                </>
              ) : (
                <>
                  <Check className="inline-block w-3 h-3 mr-1" />
                  Marcar todas como leídas
                </>
              )}
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
