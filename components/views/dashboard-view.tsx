"use client"

import { SectionCards } from "@/components/section-cards"
import { CheckinsCard } from "@/components/checkins-card"
import { PuntosAsignadosCard } from "@/components/puntos-asignados-card"
import { WelcomeModal } from "@/components/welcome-modal"
import { OnboardingBanner } from "@/components/onboarding-banner"
import { getCurrentUser, getUserProfile, updateFirstTimeStatus } from "@/lib/supabase/auth"
import { useState, useEffect } from "react"

export function DashboardView() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [userName, setUserName] = useState("Usuario")

  // Simular pasos pendientes (en producción vendría de la base de datos o estado global)
  const totalSteps = 3
  const pendingSteps = 2 // Ejemplo: 2 pasos pendientes

  // Load user profile and check if it's first time
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const user = await getCurrentUser()
        if (user) {
          const profile = await getUserProfile(user.id)
          setUserProfile(profile)
          setUserName(profile.name || "Usuario")

          // If it's first time, show welcome modal with confetti
          if (profile.first_time === true) {
            setShowConfetti(true)
            setShowWelcomeModal(true)
          }
        }
      } catch (error) {
        console.error("Error loading user profile:", error)
      }
    }

    loadUserProfile()
  }, [])

  const handleOpenModalFromBanner = () => {
    setShowConfetti(false)
    setShowWelcomeModal(true)
  }

  const handleCloseModal = async (open: boolean) => {
    console.log('🔄 handleCloseModal called', { open, userProfile })
    setShowWelcomeModal(open)

    // If closing modal and user is first time, update first_time to false
    if (!open && userProfile?.first_time === true && userProfile?.id) {
      try {
        console.log('🔄 Updating first_time status for user:', userProfile.id)
        await updateFirstTimeStatus(userProfile.id, false)
        console.log('✅ first_time status updated successfully')
        setUserProfile({ ...userProfile, first_time: false })
      } catch (error) {
        console.error("❌ Error updating first_time status:", error)
      }
    } else {
      console.log('⚠️ Conditions not met for update:', {
        open,
        first_time: userProfile?.first_time,
        userId: userProfile?.id
      })
    }
  }

  return (
    <div className="flex flex-col gap-4 pt-4 md:pt-6 md:gap-6 max-w-[1200px] mx-auto w-full pb-[100px]">
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Hola, {userName} 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Banner de onboarding */}
      <div className="px-4 lg:px-6">
        <OnboardingBanner
          onOpenModal={handleOpenModalFromBanner}
          pendingSteps={pendingSteps}
          totalSteps={totalSteps}
        />
      </div>

      <SectionCards />
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CheckinsCard />
          <PuntosAsignadosCard />
        </div>
      </div>

      <WelcomeModal
        open={showWelcomeModal}
        onOpenChange={handleCloseModal}
        showConfetti={showConfetti}
      />
    </div>
  )
}
