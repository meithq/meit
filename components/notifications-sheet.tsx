"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Bell, Check, Gift, Trophy, Users, ShoppingCart, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface NotificationsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Notification {
  id: string
  type: "info" | "success" | "gift" | "achievement"
  title: string
  description: string
  time: string
  read: boolean
}

// Array vacío - cargar datos desde la base de datos
const notificationsData: Notification[] = []

export function NotificationsSheet({ open, onOpenChange }: NotificationsSheetProps) {
  const [notifications, setNotifications] = useState(notificationsData)
  const [dismissingIds, setDismissingIds] = useState<string[]>([])

  const handleDismiss = (id: string) => {
    // Agregar el ID a la lista de notificaciones que se están descartando
    setDismissingIds(prev => [...prev, id])

    // Después de la animación (300ms), eliminar la notificación
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
      setDismissingIds(prev => prev.filter(dismissId => dismissId !== id))
    }, 300)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Check className="w-5 h-5 text-green-600" />
      case "gift":
        return <Gift className="w-5 h-5 text-purple-600" />
      case "achievement":
        return <Trophy className="w-5 h-5 text-yellow-600" />
      default:
        return <Bell className="w-5 h-5 text-blue-600" />
    }
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
    const dateKey = formatDate(notification.time)
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

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="m-4 h-[calc(100vh-2rem)] p-6 [&>button]:bg-white [&>button]:rounded-full [&>button]:w-10 [&>button]:h-10 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:border [&>button]:shadow-sm [&>button]:cursor-pointer overflow-y-auto" style={{ borderRadius: '30px', borderColor: '#eeeeee' }}>
        <SheetHeader className="pr-16">
          <SheetTitle className="text-2xl flex items-center gap-2">
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2">
                {unreadCount} nuevas
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Mantente al tanto de todas las actividades importantes
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {sortedDateKeys.map((dateKey) => (
            <div key={dateKey}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {dateKey}
              </h3>
              <div className="space-y-3">
                {groupedNotifications[dateKey].map((notification) => {
                  const isDismissing = dismissingIds.includes(notification.id)
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-[20px] border transition-all duration-300 hover:bg-accent/50 ${
                        notification.read ? 'bg-background' : 'bg-primary/5 border-primary/20'
                      } ${isDismissing ? 'translate-x-[120%] opacity-0' : 'translate-x-0 opacity-100'}`}
                      style={{ borderColor: notification.read ? '#eeeeee' : undefined }}
                    >
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.type === "success" ? "bg-green-100" :
                          notification.type === "gift" ? "bg-purple-100" :
                          notification.type === "achievement" ? "bg-yellow-100" :
                          "bg-blue-100"
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm">
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDismiss(notification.id)
                                }}
                                className="p-1 hover:bg-muted rounded-full transition-colors cursor-pointer"
                              >
                                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.description}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(notification.time)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No tienes notificaciones
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
