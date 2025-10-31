export interface Cliente {
  id: string
  nombre: string
  telefono: string
  puntos: number
  visitas: number
  ultimaVisita: string
}

// Array vacío - cargar datos desde la base de datos
export const clientesData: Cliente[] = []
