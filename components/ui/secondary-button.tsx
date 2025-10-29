import { Button } from "@/components/ui/button"
import { ButtonProps } from "@/components/ui/button"

export function SecondaryButton({ children, className = "", ...props }: ButtonProps) {
  return (
    <Button
      variant="outline"
      className={`bg-white hover:bg-primary/10 hover:text-primary [&:hover>svg]:text-primary transition-colors min-h-[56px] text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ borderRadius: '50px', borderColor: '#eeeeee' }}
      {...props}
    >
      {children}
    </Button>
  )
}
