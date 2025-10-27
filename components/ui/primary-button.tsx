import { Button } from "@/components/ui/button"
import { ButtonProps } from "@/components/ui/button"

export function PrimaryButton({ children, className = "", ...props }: ButtonProps) {
  return (
    <Button
      className={`bg-primary text-primary-foreground hover:bg-primary/90 min-h-[56px] text-base cursor-pointer ${className}`}
      style={{ borderRadius: '50px' }}
      {...props}
    >
      {children}
    </Button>
  )
}
