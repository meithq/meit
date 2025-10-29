"use client"

import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export function FormInput({ className = "", type, ...props }: React.ComponentProps<"input">) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"

  if (isPassword) {
    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={`bg-white min-h-[56px] text-base focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary pr-12 ${className}`}
          style={{ borderColor: '#eeeeee', borderRadius: '50px' }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    )
  }

  return (
    <Input
      type={type}
      className={`bg-white min-h-[56px] text-base focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary ${className}`}
      style={{ borderColor: '#eeeeee', borderRadius: '50px' }}
      {...props}
    />
  )
}
