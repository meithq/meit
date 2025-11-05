"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PrimaryButton } from "@/components/ui/primary-button"
import { Circle, CheckCircle2, Settings, Users, Gift, Building2, Trophy } from "lucide-react"
import { useState, useEffect } from "react"
import confetti from "canvas-confetti"

interface WelcomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  showConfetti?: boolean
  onNavigateToConfig?: (tab: string) => void
  onNavigateToRetos?: () => void
}

interface ChecklistItem {
  id: string
  title: string
  description: string
  icon: any
  completed: boolean
}

export function WelcomeModal({ open, onOpenChange, showConfetti = false, onNavigateToConfig, onNavigateToRetos }: WelcomeModalProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: '1',
      title: 'Configura tu negocio',
      description: 'Define la información básica de tu comercio y equipo',
      icon: Settings,
      completed: false
    },
    {
      id: '2',
      title: 'Configura las reglas de Gift Cards',
      description: 'Establece puntos necesarios y valor de las gift cards',
      icon: Gift,
      completed: false
    },
    {
      id: '3',
      title: 'Crea tu primer reto',
      description: 'Motiva a tus clientes con recompensas atractivas',
      icon: Trophy,
      completed: false
    }
  ])

  const handleStepClick = (id: string) => {
    // Cerrar el modal de bienvenida
    onOpenChange(false)

    // Navegar según el paso clickeado
    if (id === '1' && onNavigateToConfig) {
      // Paso 1: Abrir modal de configuración en pestaña Negocio
      onNavigateToConfig('negocio')
    } else if (id === '2' && onNavigateToConfig) {
      // Paso 2: Abrir modal de configuración en pestaña Puntos (Gift Cards)
      onNavigateToConfig('puntos')
    } else if (id === '3' && onNavigateToRetos) {
      // Paso 3: Navegar a la vista de retos
      onNavigateToRetos()
    }
  }

  const completedCount = checklist.filter(item => item.completed).length

  // Función para manejar el cierre del modal
  const handleClose = () => {
    // Siempre llamar a onOpenChange para cerrar el modal y actualizar first_time
    onOpenChange(false)
  }

  // Trigger confetti fireworks when modal opens
  useEffect(() => {
    if (open && showConfetti) {
      const duration = 5 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min

      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [open, showConfetti])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] p-0 overflow-hidden"
        style={{ borderRadius: '30px' }}
        hideCloseButton={showConfetti}
        onInteractOutside={(e) => {
          if (showConfetti) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          if (showConfetti) {
            e.preventDefault()
          }
        }}
      >
        {/* Header con fondo animado */}
        <div className="relative overflow-hidden p-8 text-white" style={{ background: 'linear-gradient(135deg, #1a1f3a 0%, #0f1629 100%)' }}>
          {/* Formas geométricas animadas */}
          <div className="absolute inset-0">
            {/* Círculo grande púrpura */}
            <div className="absolute w-64 h-64 rounded-full opacity-40 animate-float"
              style={{
                background: 'oklch(0.5854 0.2041 277.1173)',
                top: '-20%',
                left: '-20%',
                filter: 'blur(40px)',
                animationDuration: '20s',
                animationDelay: '0s'
              }}></div>

            {/* Círculo cyan */}
            <div className="absolute w-56 h-56 rounded-full opacity-40 animate-float-reverse"
              style={{
                background: 'oklch(0.8431 0.0824 180.0000)',
                top: '30%',
                right: '-15%',
                filter: 'blur(40px)',
                animationDuration: '25s',
                animationDelay: '2s'
              }}></div>

            {/* Círculo magenta */}
            <div className="absolute w-48 h-48 rounded-full opacity-30 animate-float"
              style={{
                background: 'oklch(0.4545 0.1844 321.4624)',
                bottom: '-10%',
                left: '20%',
                filter: 'blur(30px)',
                animationDuration: '18s',
                animationDelay: '1s'
              }}></div>

            {/* Forma orgánica 1 */}
            <div className="absolute w-40 h-40 rounded-[40%_60%_70%_30%/60%_30%_70%_40%] opacity-20 animate-float-slow"
              style={{
                background: 'oklch(0.5106 0.2301 276.9656)',
                top: '40%',
                right: '25%',
                animationDuration: '30s',
                animationDelay: '3s'
              }}></div>
          </div>

          {/* Contenido del header */}
          <div className="relative z-10">
            <DialogHeader className="text-center space-y-2">
              <DialogTitle className="text-3xl font-bold text-white">
                ¡Bienvenido a MEIT! 🎉
              </DialogTitle>
              <DialogDescription className="text-white/90 text-base">
                Completa estos pasos para comenzar
              </DialogDescription>
            </DialogHeader>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-white/80 mb-2">
                <span>Progreso</span>
                <span>{completedCount} de {checklist.length}</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${(completedCount / checklist.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido - Checklist */}
        <div className="p-8 space-y-4">
          <h3 className="font-semibold text-lg mb-4">Primeros pasos</h3>

          <div className="space-y-3">
            {checklist.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleStepClick(item.id)}
                  className="w-full flex items-start gap-4 p-4 rounded-2xl border transition-all hover:border-primary/40 hover:bg-primary/5 cursor-pointer text-left"
                  style={{ borderColor: item.completed ? 'oklch(0.4545 0.1844 321.4624)' : '#eeeeee', backgroundColor: item.completed ? 'oklch(0.4545 0.1844 321.4624 / 0.05)' : '#fff' }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {item.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-5 h-5 text-primary" />
                      <h4 className={`font-medium text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="pt-4">
            <PrimaryButton
              onClick={handleClose}
              className="w-full"
            >
              {completedCount === checklist.length ? '¡Excelente trabajo!' : 'Continuar después'}
            </PrimaryButton>
          </div>
        </div>
      </DialogContent>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -30px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 30px) scale(1.05);
          }
        }

        @keyframes float-reverse {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(-30px, 30px) scale(0.9);
          }
          50% {
            transform: translate(20px, -20px) scale(1.1);
          }
          75% {
            transform: translate(-20px, -30px) scale(1.05);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(15px, -20px) rotate(5deg);
          }
          66% {
            transform: translate(-15px, 15px) rotate(-5deg);
          }
        }

        .animate-float {
          animation: float infinite ease-in-out;
        }

        .animate-float-reverse {
          animation: float-reverse infinite ease-in-out;
        }

        .animate-float-slow {
          animation: float-slow infinite ease-in-out;
        }
      `}</style>
    </Dialog>
  )
}
