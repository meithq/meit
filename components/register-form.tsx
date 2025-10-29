"use client"

import { cn } from "@/lib/utils"
import { FormInput } from "@/components/ui/form-input"
import { Label } from "@/components/ui/label"
import { PrimaryButton } from "@/components/ui/primary-button"
import { SecondaryButton } from "@/components/ui/secondary-button"
import { signUpWithEmail, signInWithGoogle, verifyOTP, resendOTP } from "@/lib/supabase/auth"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mail } from "lucide-react"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [resendCountdown, setResendCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ]

  // Countdown timer for resend
  useEffect(() => {
    if (showOTP && resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (showOTP && resendCountdown === 0) {
      setCanResend(true)
    }
  }, [showOTP, resendCountdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Sign up user - this will send the confirm signup email with OTP
      await signUpWithEmail(email, password, { name })
      // Show OTP form after successful signup
      setShowOTP(true)
    } catch (err: any) {
      console.error("Error al registrarse:", err)
      setError(err.message || "Error al crear la cuenta. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto focus next input
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus()
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const otpCode = otp.join("")

    if (otpCode.length !== 6) {
      setError("Por favor ingresa el código completo")
      setLoading(false)
      return
    }

    try {
      await verifyOTP(email, otpCode)

      setSuccess(true)
      setTimeout(() => {
        router.push("/admin")
        router.refresh()
      }, 1500)
    } catch (err: any) {
      console.error("Error al verificar OTP:", err)
      setError("Código incorrecto. Por favor intenta de nuevo.")
      setOtp(["", "", "", "", "", ""])
      otpRefs[0].current?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    setError("")
    setResendSuccess(false)

    try {
      await resendOTP(email)
      setResendSuccess(true)
      setResendCountdown(60)
      setCanResend(false)
      setTimeout(() => setResendSuccess(false), 3000)
    } catch (err: any) {
      console.error("Error al reenviar OTP:", err)
      setError("Error al reenviar el código. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (err: any) {
      console.error("Error con Google:", err)
      setError(err.message || "Error al registrarse con Google")
    }
  }

  // Show OTP verification form
  if (showOTP) {
    return (
      <form className={cn("flex flex-col gap-6", className)} onSubmit={handleVerifyOTP} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Verifica tu correo</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Hemos enviado un código de verificación de 6 dígitos a <span className="font-semibold text-foreground">{email}</span>
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-2xl">
            ¡Código verificado! Redirigiendo...
          </div>
        )}

        {resendSuccess && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-2xl">
            Código enviado. Revisa tu correo.
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="otp">Código de verificación</Label>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={otpRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  disabled={loading}
                  className="w-14 h-14 text-center text-2xl font-bold rounded-2xl border-2 border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                  style={{ borderColor: digit ? 'oklch(0.4545 0.1844 321.4624)' : '#eeeeee' }}
                />
              ))}
            </div>
          </div>

          <PrimaryButton type="submit" disabled={loading || otp.join("").length !== 6}>
            {loading ? "Verificando..." : "Verificar código"}
          </PrimaryButton>

          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-sm text-primary hover:underline underline-offset-4 disabled:opacity-50 cursor-pointer"
              >
                ¿No recibiste el código? Reenviar
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">
                ¿No recibiste el código?{" "}
                <span className="text-primary">
                  Reenviar en {resendCountdown}s
                </span>
              </p>
            )}
          </div>
        </div>
      </form>
    )
  }

  // Show registration form
  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Crear cuenta</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Completa los datos para comenzar. Te enviaremos un código de verificación a tu correo
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">
            Tu nombre completo <span className="text-red-500">*</span>
          </Label>
          <FormInput
            id="name"
            type="text"
            placeholder="Juan Pérez"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">
            Correo electrónico <span className="text-red-500">*</span>
          </Label>
          <FormInput
            id="email"
            type="email"
            placeholder="tu@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">
            Contraseña <span className="text-red-500">*</span>
          </Label>
          <FormInput
            id="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Debe tener al menos 6 caracteres
          </p>
        </div>

        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Procesando..." : "Continuar"}
        </PrimaryButton>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            O continúa con
          </span>
        </div>
      </div>

      <SecondaryButton type="button" onClick={handleGoogleLogin} disabled={loading}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continuar con Google
      </SecondaryButton>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes una cuenta?{" "}
        <a href="/ingreso" className="text-primary underline underline-offset-4 hover:text-primary/80">
          Inicia sesión aquí
        </a>
      </p>

      <p className="text-xs text-center text-muted-foreground">
        Al crear una cuenta, aceptas nuestros{" "}
        <a href="#" className="underline hover:text-foreground">
          términos de servicio
        </a>{" "}
        y{" "}
        <a href="#" className="underline hover:text-foreground">
          política de privacidad
        </a>
      </p>
    </form>
  )
}
