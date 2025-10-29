"use client"

import { SecondaryButton } from "@/components/ui/secondary-button"
import { Sparkles } from "lucide-react"

interface OnboardingBannerProps {
  onOpenModal: () => void
  pendingSteps: number
  totalSteps: number
}

export function OnboardingBanner({ onOpenModal, pendingSteps, totalSteps }: OnboardingBannerProps) {
  if (pendingSteps === 0) return null

  const completedSteps = totalSteps - pendingSteps

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 mb-6" style={{
      background: 'linear-gradient(135deg, #1a1f3a 0%, #0f1629 100%)'
    }}>
      {/* Formas geométricas de fondo (más sutiles) */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute w-48 h-48 rounded-full animate-float"
          style={{
            background: 'oklch(0.5854 0.2041 277.1173)',
            top: '-20%',
            right: '10%',
            filter: 'blur(40px)',
            animationDuration: '20s'
          }}></div>
        <div className="absolute w-40 h-40 rounded-full animate-float-reverse"
          style={{
            background: 'oklch(0.4545 0.1844 321.4624)',
            bottom: '-10%',
            left: '5%',
            filter: 'blur(30px)',
            animationDuration: '25s'
          }}></div>
      </div>

      {/* Contenido */}
      <div className="relative z-10 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg mb-1">
              ¡Completa tu configuración inicial!
            </h3>
            <p className="text-white/80 text-sm">
              Tienes <span className="font-semibold">{pendingSteps} paso{pendingSteps > 1 ? 's' : ''}</span> pendiente{pendingSteps > 1 ? 's' : ''} para comenzar ({completedSteps}/{totalSteps} completados)
            </p>
          </div>
        </div>

        <SecondaryButton
          onClick={onOpenModal}
          className="flex-shrink-0 hover:!bg-white hover:!border-white/80"
        >
          Ver pasos
        </SecondaryButton>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, -20px) scale(1.1);
          }
        }

        @keyframes float-reverse {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-20px, 20px) scale(1.1);
          }
        }

        .animate-float {
          animation: float infinite ease-in-out;
        }

        .animate-float-reverse {
          animation: float-reverse infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}
