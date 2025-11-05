'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@meit/supabase/client';

export interface PointsCalculation {
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  completedChallenges: CompletedChallenge[];
}

export interface CompletedChallenge {
  id: string;
  name: string;
  points: number;
}

interface UsePointsCalculatorReturn {
  calculation: PointsCalculation | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to calculate points based on purchase amount and active challenges
 * @param customerId - Customer ID to check for completed challenges
 * @param amount - Purchase amount in USD
 * @param merchantId - Merchant ID to fetch active challenges
 */
export function usePointsCalculator(
  customerId: string | null,
  amount: number,
  merchantId: string | null
): UsePointsCalculatorReturn {
  const [calculation, setCalculation] = useState<PointsCalculation | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset calculation if no customer or invalid amount
    if (!customerId || amount < 1 || !merchantId) {
      setCalculation(null);
      return;
    }

    const calculatePoints = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Calculate base points (1 point = $1 USD by default)
        const basePoints = Math.floor(amount);

        // 2. Fetch active challenges for the merchant
        // NOTE: Challenges table may not exist yet - handle gracefully
        let challenges: Array<{
          id: string;
          name: string;
          points_reward: number;
          type: string;
          target_value: number | null;
        }> = [];

        try {
          const { data: challengesData, error: challengesError } =
            await supabase
              .from('challenges')
              .select('id, name, points_reward, type, target_value')
              .eq('merchant_id', merchantId)
              .eq('is_active', true);

          if (!challengesError && challengesData && Array.isArray(challengesData)) {
            challenges = challengesData as unknown as typeof challenges;
          }
        } catch (err) {
          // Challenges table might not exist yet, continue without challenges
          console.warn('Challenges table not available:', err);
        }

        // 3. Check which challenges are completed by this transaction
        const completedChallenges: CompletedChallenge[] = [];
        let bonusPoints = 0;

        if (challenges && challenges.length > 0) {
          for (const challenge of challenges) {
            let isCompleted = false;

            switch (challenge.type) {
              case 'amount_min':
                // Challenge completed if amount meets or exceeds target
                if (
                  challenge.target_value &&
                  amount >= challenge.target_value
                ) {
                  isCompleted = true;
                }
                break;

              case 'time_based':
                // For time-based challenges (e.g., "Mañana" - morning purchases)
                const hour = new Date().getHours();
                if (challenge.target_value) {
                  // Example: target_value could be hour range like 6-12 for morning
                  const targetHour = challenge.target_value;
                  if (hour >= 6 && hour < 12 && targetHour === 6) {
                    isCompleted = true;
                  }
                }
                break;

              // Additional challenge types can be added here
              default:
                break;
            }

            if (isCompleted) {
              completedChallenges.push({
                id: challenge.id,
                name: challenge.name,
                points: challenge.points_reward,
              });
              bonusPoints += challenge.points_reward;
            }
          }
        }

        // 4. Calculate total points
        const totalPoints = basePoints + bonusPoints;

        setCalculation({
          basePoints,
          bonusPoints,
          totalPoints,
          completedChallenges,
        });
      } catch (err) {
        console.error('Error calculating points:', err);
        setError(
          err instanceof Error ? err.message : 'Error al calcular puntos'
        );
        setCalculation(null);
      } finally {
        setLoading(false);
      }
    };

    calculatePoints();
  }, [customerId, amount, merchantId]);

  return {
    calculation,
    loading,
    error,
  };
}
