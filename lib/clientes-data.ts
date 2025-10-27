export interface Cliente {
  id: string
  nombre: string
  telefono: string
  puntos: number
  visitas: number
  ultimaVisita: string
}

// Datos de ejemplo
export const clientesData: Cliente[] = [
  {
    id: "1",
    nombre: "María González",
    telefono: "+58 412-1234567",
    puntos: 1250,
    visitas: 24,
    ultimaVisita: "2025-10-23"
  },
  {
    id: "2",
    nombre: "Carlos Rodríguez",
    telefono: "+58 414-9876543",
    puntos: 850,
    visitas: 18,
    ultimaVisita: "2025-10-22"
  },
  {
    id: "3",
    nombre: "Ana Martínez",
    telefono: "+58 424-5551234",
    puntos: 2100,
    visitas: 42,
    ultimaVisita: "2025-10-23"
  },
  {
    id: "4",
    nombre: "Luis Pérez",
    telefono: "+58 416-7778888",
    puntos: 650,
    visitas: 12,
    ultimaVisita: "2025-10-21"
  },
  {
    id: "5",
    nombre: "Carmen Silva",
    telefono: "+58 412-3334444",
    puntos: 1500,
    visitas: 30,
    ultimaVisita: "2025-10-23"
  },
  {
    id: "6",
    nombre: "Pedro Hernández",
    telefono: "+58 414-2223333",
    puntos: 980,
    visitas: 20,
    ultimaVisita: "2025-10-20"
  },
  {
    id: "7",
    nombre: "Isabel Morales",
    telefono: "+58 424-6667777",
    puntos: 1800,
    visitas: 35,
    ultimaVisita: "2025-10-22"
  },
  {
    id: "8",
    nombre: "Roberto Díaz",
    telefono: "+58 416-4445555",
    puntos: 420,
    visitas: 8,
    ultimaVisita: "2025-10-19"
  },
  {
    id: "9",
    nombre: "Laura Fernández",
    telefono: "+58 412-8889999",
    puntos: 2500,
    visitas: 50,
    ultimaVisita: "2025-10-23"
  },
  {
    id: "10",
    nombre: "Miguel Torres",
    telefono: "+58 414-1112222",
    puntos: 1100,
    visitas: 22,
    ultimaVisita: "2025-10-21"
  },
  {
    id: "11",
    nombre: "Sofía Ramírez",
    telefono: "+58 424-9990000",
    puntos: 750,
    visitas: 15,
    ultimaVisita: "2025-10-20"
  },
  {
    id: "12",
    nombre: "Jorge Castillo",
    telefono: "+58 416-3332222",
    puntos: 1650,
    visitas: 33,
    ultimaVisita: "2025-10-23"
  },
]
