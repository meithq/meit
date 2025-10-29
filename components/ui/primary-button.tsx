import { Button } from "@/components/ui/button"

export function PrimaryButton({ children, className = "", ...props }: React.ComponentProps<"button">) {
  return (
    <Button
      className={`bg-primary text-primary-foreground hover:bg-primary/90 min-h-[56px] text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ borderRadius: '50px' }}
      {...props}
    >
      {children}
    </Button>
  )
}
