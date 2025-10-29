import { GalleryVerticalEnd } from "lucide-react"

import { RegisterForm } from "@/components/register-form"
import { AuthBackground } from "@/components/auth-background"

const slides = [
  {
    title: "Impulsa la lealtad",
    description: "Crea un programa de fidelidad personalizado que mantenga a tus clientes regresando."
  },
  {
    title: "Crece tu negocio",
    description: "Aumenta tus ventas recompensando a tus clientes más fieles de manera automática."
  },
  {
    title: "Fácil de configurar",
    description: "Configura tu programa en minutos y empieza a ver resultados inmediatamente."
  },
  {
    title: "Todo en un solo lugar",
    description: "Gestiona clientes, puntos, retos y gift cards desde un solo dashboard."
  }
]

export default function RegisterPage() {
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
            <RegisterForm />
          </div>
        </div>
      </div>
      <AuthBackground slides={slides} />
    </div>
  )
}
