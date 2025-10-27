import { Input } from "@/components/ui/input"
import { InputProps } from "@/components/ui/input"

export function FormInput({ className = "", ...props }: InputProps) {
  return (
    <Input
      className={`bg-white min-h-[56px] text-base focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary ${className}`}
      style={{ borderColor: '#eeeeee', borderRadius: '50px' }}
      {...props}
    />
  )
}
