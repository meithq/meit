export interface Sucursal {
  id: string
  nombre: string
  codigo: string
  direccion: string
  telefono: string
  empleados: number
  estado: "activa" | "inactiva"
}

// Datos de ejemplo
export const sucursalesData: Sucursal[] = [
  {
    id: "1",
    nombre: "Sucursal Centro",
    codigo: "BRANCH_58ef6acc",
    direccion: "Av. Principal, Centro Comercial Plaza",
    telefono: "+58 212-1234567",
    empleados: 15,
    estado: "activa"
  },
  {
    id: "2",
    nombre: "Sucursal Este",
    codigo: "BRANCH_42cd89ef",
    direccion: "Calle 5, Centro Comercial El Este",
    telefono: "+58 212-2345678",
    empleados: 12,
    estado: "activa"
  },
  {
    id: "3",
    nombre: "Sucursal Oeste",
    codigo: "BRANCH_7a9b3c12",
    direccion: "Av. Libertador, Local 45",
    telefono: "+58 212-3456789",
    empleados: 10,
    estado: "activa"
  },
  {
    id: "4",
    nombre: "Sucursal Norte",
    codigo: "BRANCH_d4e5f6a7",
    direccion: "Calle 12, Sector Norte",
    telefono: "+58 212-4567890",
    empleados: 8,
    estado: "inactiva"
  },
  {
    id: "5",
    nombre: "Sucursal Sur",
    codigo: "BRANCH_9c8b7a65",
    direccion: "Av. Sur, Centro Comercial Las Américas",
    telefono: "+58 212-5678901",
    empleados: 14,
    estado: "activa"
  },
]
