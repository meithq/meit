'use client';

import { useState } from 'react';
import { supabase } from '@meit/supabase/client';
import { toast } from 'sonner';

interface AssignPointsData {
  customerId: string;
  merchantId: string;
  branchId: string | null;
  amount: number;
  points: number;
  challengeIds: string[];
}

interface AssignPointsResult {
  success: boolean;
  giftCardGenerated: boolean;
  giftCardCode?: string;
}

interface UsePosTransactionReturn {
  assignPoints: (data: AssignPointsData) => Promise<AssignPointsResult>;
  submitting: boolean;
}

/**
 * Custom hook to handle POS transaction submission
 * Creates point transaction, updates customer points, and generates gift cards if threshold reached
 */
export function usePosTransaction(): UsePosTransactionReturn {
  const [submitting, setSubmitting] = useState(false);

  const assignPoints = async (
    data: AssignPointsData
  ): Promise<AssignPointsResult> => {
    setSubmitting(true);

    try {
      // 1. Get current customer data
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('total_points, name')
        .eq('id', data.customerId)
        .single();

      if (customerError) {
        throw customerError;
      }

      if (!customer) {
        throw new Error('Cliente no encontrado');
      }

      // 2. Create point transaction record
      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert([
          {
            customer_id: data.customerId,
            merchant_id: data.merchantId,
            transaction_type: 'earned',
            points: data.points,
            description: `Compra: $${data.amount.toFixed(2)} USD`,
            reference_data: {
              amount: data.amount,
              base_points: Math.floor(data.amount),
              bonus_points: data.points - Math.floor(data.amount),
              challenge_ids: data.challengeIds,
              branch_id: data.branchId,
            },
          },
        ]);

      if (transactionError) {
        throw transactionError;
      }

      // 3. Update customer total_points and visit_count
      const newTotalPoints = (customer.total_points || 0) + data.points;

      const { error: updateError } = await supabase
        .from('customers')
        .update({
          total_points: newTotalPoints,
          last_visit: new Date().toISOString(),
        })
        .eq('id', data.customerId);

      if (updateError) {
        throw updateError;
      }

      // 4. Check if gift card should be generated (threshold: 100 points by default)
      const giftCardThreshold = 100;
      let giftCardGenerated = false;
      let giftCardCode: string | undefined;

      if (newTotalPoints >= giftCardThreshold) {
        // Calculate remaining points after gift card generation
        const remainingPoints = newTotalPoints % giftCardThreshold;

        // Generate gift card code (format: MEIT-XXXX-XXXX)
        const generateCode = () => {
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
          const part1 = Array.from(
            { length: 4 },
            () => chars[Math.floor(Math.random() * chars.length)]
          ).join('');
          const part2 = Array.from(
            { length: 4 },
            () => chars[Math.floor(Math.random() * chars.length)]
          ).join('');
          return `MEIT-${part1}-${part2}`;
        };

        giftCardCode = generateCode();

        // 5. Create gift card record
        const { error: giftCardError } = await supabase
          .from('gift_cards')
          .insert([
            {
              customer_id: data.customerId,
              merchant_id: data.merchantId,
              code: giftCardCode,
              amount: 5.0, // $5 USD default
              points_used: giftCardThreshold,
              status: 'active',
            } as never,
          ]);

        if (giftCardError) {
          console.error('Error creating gift card:', giftCardError);
          // Don't throw - gift card generation is not critical
        } else {
          giftCardGenerated = true;

          // Update customer points (deduct used points)
          await supabase
            .from('customers')
            .update({
              total_points: remainingPoints,
            })
            .eq('id', data.customerId);
        }
      }

      // 6. TODO: Trigger WhatsApp notification via Edge Function
      // This will be implemented in a future iteration

      // Show success message
      toast.success(
        `${data.points} puntos asignados a ${customer.name}`,
        {
          description: giftCardGenerated
            ? `¡Gift card generada! Código: ${giftCardCode}`
            : undefined,
          duration: 5000,
        }
      );

      return {
        success: true,
        giftCardGenerated,
        giftCardCode,
      };
    } catch (err) {
      console.error('Error assigning points:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Error al asignar puntos';
      toast.error(errorMessage);

      return {
        success: false,
        giftCardGenerated: false,
      };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    assignPoints,
    submitting,
  };
}
