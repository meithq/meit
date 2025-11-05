'use client';

import { useState } from 'react';
import { supabase } from '@meit/supabase/client';

export interface Customer {
  id: string;
  name: string | null;
  phone: string;
  total_points: number;
  gift_cards_count?: number;
}

interface UseCustomerLookupReturn {
  phone: string;
  setPhone: (phone: string) => void;
  customer: Customer | null;
  loading: boolean;
  error: string | null;
  searchCustomer: () => Promise<void>;
  clearCustomer: () => void;
}

/**
 * Custom hook for customer lookup by phone number
 * Handles search, loading states, and error management
 */
export function useCustomerLookup(): UseCustomerLookupReturn {
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCustomer = async () => {
    if (!phone || phone.length < 10) {
      setError('Por favor ingrese un número de teléfono válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query customer by phone with gift cards count
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select(
          `
          id,
          name,
          phone,
          total_points,
          gift_cards:gift_cards(count)
        `
        )
        .eq('phone', phone)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        setError('Cliente no encontrado');
        setCustomer(null);
      } else {
        // Transform the data to include gift_cards_count
        const customerData: Customer = {
          id: data.id,
          name: data.name || 'Cliente',
          phone: data.phone,
          total_points: data.total_points || 0,
          gift_cards_count: Array.isArray(data.gift_cards)
            ? data.gift_cards.length
            : 0,
        };
        setCustomer(customerData);
        setError(null);
      }
    } catch (err) {
      console.error('Error searching customer:', err);
      setError(
        err instanceof Error ? err.message : 'Error al buscar cliente'
      );
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const clearCustomer = () => {
    setCustomer(null);
    setPhone('');
    setError(null);
  };

  return {
    phone,
    setPhone,
    customer,
    loading,
    error,
    searchCustomer,
    clearCustomer,
  };
}
