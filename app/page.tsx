import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          Bienvenido a <span className="text-primary-600">Meit</span>
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
          Sistema de fidelización y gestión de clientes para tu negocio
        </p>
        <Button
          asChild
          size="lg"
          className="w-full sm:w-auto px-4 min-h-[56px] text-base rounded-[50px]"
        >
          <Link href="/admin">
            <LogIn className="mr-2 h-5 w-5" />
            Iniciar Sesión
          </Link>
        </Button>
      </div>
    </div>
  );
}
