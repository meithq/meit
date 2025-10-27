import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, BarChart3, Users, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl mb-6">
            Bienvenido a <span className="text-blue-600">Meit</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Una plataforma moderna construida con Next.js, shadcn/ui y las mejores prácticas de desarrollo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/admin">
                <Settings className="mr-2 h-5 w-5" />
                Ir al Dashboard
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              <FileText className="mr-2 h-5 w-5" />
              Documentación
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Analytics
              </CardTitle>
              <CardDescription>
                Visualiza datos y métricas importantes con gráficos interactivos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Dashboard completo con componentes de shadcn/ui para análisis de datos.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Gestión
              </CardTitle>
              <CardDescription>
                Administra usuarios, permisos y configuraciones del sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Panel de administración completo con todas las herramientas necesarias.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Configuración
              </CardTitle>
              <CardDescription>
                Personaliza la aplicación según tus necesidades específicas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Interfaz moderna y responsive construida con las mejores prácticas.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            Construido con Next.js 16, React 19, shadcn/ui y Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
}
