export interface Challenge {
  id: string
  business_id: number
  name: string
  description: string | null
  points: number
  challenge_type: string
  target_value: number | null
  is_repeatable: boolean
  max_completions_per_day: number | null
  max_completions_total: number | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ActiveChallenge {
  id: string
  name: string
  description: string | null
  points: number
  challenge_type: string
  target_value: number | null
}
