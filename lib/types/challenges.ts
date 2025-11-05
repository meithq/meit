/**
 * Tipos para el sistema de retos/desafíos
 */

export type ChallengeType =
  | 'monto_minimo'
  | 'horario_visita'
  | 'frecuencia_visitas'
  | 'categoria_producto'

export interface Challenge {
  id: string
  name: string
  description: string | null
  points: number
  challenge_type: ChallengeType
  target_value: number
  is_repeatable: boolean
  max_completions_per_day: number | null
  max_completions_total: number | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  business_id: number
}

export interface CreateChallengeInput {
  name: string
  description?: string
  points: number
  challenge_type: ChallengeType
  target_value: number
  is_repeatable?: boolean
  max_completions_per_day?: number
  max_completions_total?: number
  start_date?: string
  end_date?: string
  is_active?: boolean
  business_id: number
}

export interface UpdateChallengeInput {
  name?: string
  description?: string
  points?: number
  challenge_type?: ChallengeType
  target_value?: number
  is_repeatable?: boolean
  max_completions_per_day?: number
  max_completions_total?: number
  start_date?: string
  end_date?: string
  is_active?: boolean
}

// Helpers para codificar/decodificar target_value según el tipo
export interface HorarioVisitaValue {
  horaInicio: string // "09:00"
  horaFin: string // "17:00"
}

export interface FrecuenciaVisitasValue {
  numeroVisitas: number
  diasPeriodo: number
}

/**
 * Codifica el valor objetivo según el tipo de reto
 */
export function encodeTargetValue(
  challengeType: ChallengeType,
  data: any
): number {
  switch (challengeType) {
    case 'monto_minimo':
      // Monto en USD directo
      return parseInt(data.montoMinimo) || 0

    case 'horario_visita':
      // Codificar hora inicio y fin como un número
      // Formato: HHMM (inicio) concatenado con HHMM (fin)
      // Ej: 09:00 - 17:00 -> 9001700
      const horaInicioNum = parseInt(data.horaInicio.replace(':', ''))
      const horaFinNum = parseInt(data.horaFin.replace(':', ''))
      return horaInicioNum * 10000 + horaFinNum

    case 'frecuencia_visitas':
      // Codificar número de visitas y días en un solo número
      // Formato: VVVDDD (visitas + días)
      // Ej: 5 visitas en 7 días -> 5007
      const visitas = parseInt(data.numeroVisitas) || 0
      const dias = parseInt(data.diasPeriodo) || 7
      return visitas * 1000 + dias

    case 'categoria_producto':
      // Para categoría, guardar como hash del string
      // O simplemente 0 y guardar el nombre en otro campo
      return 0

    default:
      return 0
  }
}

/**
 * Decodifica el valor objetivo según el tipo de reto
 */
export function decodeTargetValue(
  challengeType: ChallengeType,
  targetValue: number
): any {
  switch (challengeType) {
    case 'monto_minimo':
      return { montoMinimo: targetValue.toString() }

    case 'horario_visita':
      // Decodificar 9001700 -> 09:00 - 17:00
      const horaInicioNum = Math.floor(targetValue / 10000)
      const horaFinNum = targetValue % 10000
      const horaInicio = `${String(Math.floor(horaInicioNum / 100)).padStart(2, '0')}:${String(horaInicioNum % 100).padStart(2, '0')}`
      const horaFin = `${String(Math.floor(horaFinNum / 100)).padStart(2, '0')}:${String(horaFinNum % 100).padStart(2, '0')}`
      return { horaInicio, horaFin }

    case 'frecuencia_visitas':
      // Decodificar 5007 -> 5 visitas en 7 días
      const visitas = Math.floor(targetValue / 1000)
      const dias = targetValue % 1000
      return { numeroVisitas: visitas.toString(), diasPeriodo: dias.toString() }

    case 'categoria_producto':
      return { categoria: '' }

    default:
      return {}
  }
}
