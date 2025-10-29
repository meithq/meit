import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import { AuthBackground } from "@/components/auth-background"

const slides = [
  {
    title: "Gestiona tu fidelidad",
    description: "Administra puntos, gift cards y clientes desde cualquier lugar con MEIT."
  },
  {
    title: "Recompensa a tus clientes",
    description: "Crea retos personalizados y aumenta la participación de tu programa de lealtad."
  },
  {
    title: "Analítica en tiempo real",
    description: "Toma decisiones inteligentes con datos actualizados de tu negocio."
  },
  {
    title: "WhatsApp integrado",
    description: "Conecta con tus clientes directamente a través de mensajes automáticos."
  }
]

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            MEIT
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <AuthBackground slides={slides} />
    </div>
  )
}
