export interface Sucursal {
  id: string
  nombre: string
  codigo: string
  direccion: string
  telefono: string
  empleados: number
  estado: "activa" | "inactiva"
}

// Array vacío - cargar datos desde la base de datos
export const sucursalesData: Sucursal[] = []
