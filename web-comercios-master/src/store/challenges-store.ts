import { create } from 'zustand'
import type { Challenge } from '@/types/database'

interface ChallengesState {
  challenges: Challenge[]
  loading: boolean
  activeOnly: boolean
}

interface ChallengesActions {
  setChallenges: (challenges: Challenge[]) => void
  addChallenge: (challenge: Challenge) => void
  updateChallenge: (id: string, data: Partial<Challenge>) => void
  removeChallenge: (id: string) => void
  toggleChallengeStatus: (id: string) => void
  setLoading: (loading: boolean) => void
  setActiveOnly: (activeOnly: boolean) => void
  reset: () => void
}

type ChallengesStore = ChallengesState & ChallengesActions

const initialState: ChallengesState = {
  challenges: [],
  loading: false,
  activeOnly: true,
}

/**
 * Challenges store using Zustand
 *
 * Manages challenges list state and filters
 *
 * Usage:
 * ```typescript
 * const { challenges, loading, setChallenges, toggleChallengeStatus } = useChallengesStore()
 * ```
 */
export const useChallengesStore = create<ChallengesStore>((set) => ({
  ...initialState,

  setChallenges: (challenges) => {
    set({ challenges })
  },

  addChallenge: (challenge) => {
    set((state) => ({
      challenges: [challenge, ...state.challenges],
    }))
  },

  updateChallenge: (id, data) => {
    set((state) => ({
      challenges: state.challenges.map((challenge) =>
        challenge.id === id ? { ...challenge, ...data } : challenge
      ),
    }))
  },

  removeChallenge: (id) => {
    set((state) => ({
      challenges: state.challenges.filter((challenge) => challenge.id !== id),
    }))
  },

  toggleChallengeStatus: (id) => {
    set((state) => ({
      challenges: state.challenges.map((challenge) =>
        challenge.id === id
          ? { ...challenge, is_active: !challenge.is_active }
          : challenge
      ),
    }))
  },

  setLoading: (loading) => {
    set({ loading })
  },

  setActiveOnly: (activeOnly) => {
    set({ activeOnly })
  },

  reset: () => {
    set(initialState)
  },
}))
