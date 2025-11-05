'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCustomerLookup } from '@/hooks/use-customer-lookup';
import { usePointsCalculator } from '@/hooks/use-points-calculator';
import { usePosTransaction } from '@/hooks/use-pos-transaction';
import { CustomerLookup } from './components/customer-lookup';
import { PurchaseInput } from './components/purchase-input';
import { PointsCalculator } from './components/points-calculator';
import { GiftCardAlert } from './components/gift-card-alert';
import { PosActions } from './components/pos-actions';

/**
 * POS (Point of Sale) Page
 * Critical flow for assigning points to customers
 * Target: <10 seconds from lookup to confirmation
 */
export default function PosPage() {
  const router = useRouter();

  // State
  const [amount, setAmount] = useState('');
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [branchId] = useState<string | null>(null); // Future use for multi-branch support

  // Hooks
  const {
    phone,
    setPhone,
    customer,
    loading: customerLoading,
    error: customerError,
    searchCustomer,
    clearCustomer,
  } = useCustomerLookup();

  const { calculation, loading: calculationLoading } = usePointsCalculator(
    customer?.id || null,
    parseFloat(amount) || 0,
    merchantId
  );

  const { assignPoints, submitting } = usePosTransaction();

  // Get merchant ID from auth on mount
  useEffect(() => {
    const fetchMerchantData = async () => {
      // TODO: Get from auth context/store
      // For now, we'll simulate getting it from localStorage or auth
      const storedMerchantId = localStorage.getItem('merchantId');
      if (storedMerchantId) {
        setMerchantId(storedMerchantId);
      }
      // In production, get from: useAuthStore((state) => state.merchantId)
    };

    fetchMerchantData();
  }, []);

  // Auto-focus phone input on mount
  useEffect(() => {
    const phoneInput = document.querySelector(
      'input[type="tel"]'
    ) as HTMLInputElement;
    if (phoneInput) {
      phoneInput.focus();
    }
  }, []);

  // Handlers
  const handleAssignPoints = async () => {
    if (!customer || !calculation || !merchantId) {
      return;
    }

    const result = await assignPoints({
      customerId: customer.id,
      merchantId,
      branchId,
      amount: parseFloat(amount),
      points: calculation.totalPoints,
      challengeIds: calculation.completedChallenges.map((c) => c.id),
    });

    if (result.success) {
      // Reset form for next customer
      handleCancel();

      // Auto-focus phone input for next customer
      setTimeout(() => {
        const phoneInput = document.querySelector(
          'input[type="tel"]'
        ) as HTMLInputElement;
        if (phoneInput) {
          phoneInput.focus();
        }
      }, 100);
    }
  };

  const handleCancel = () => {
    clearCustomer();
    setAmount('');
  };

  const handleClearCustomer = () => {
    clearCustomer();
    // Keep amount for quick entry of next customer
  };

  const handleClearAmount = () => {
    setAmount('');
  };

  // Validation
  const numericAmount = parseFloat(amount) || 0;
  const canAssign =
    customer !== null && numericAmount >= 1 && calculation !== null && !submitting;

  // Check if gift card will be generated
  const willGenerateGiftCard =
    customer !== null && customer.total_points + (calculation?.totalPoints || 0) >= 100;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="ghost"
                size="icon"
                aria-label="Volver al dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
                  <CreditCard className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900">
                    Punto de Venta
                  </h1>
                  <p className="text-sm text-neutral-600">
                    Asignación rápida de puntos
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {customer && calculation && (
              <div className="hidden md:flex items-center gap-4">
                <Card className="px-4 py-2">
                  <p className="text-xs text-neutral-600">Cliente</p>
                  <p className="text-sm font-semibold text-neutral-900">
                    {customer.name}
                  </p>
                </Card>
                <Card className="px-4 py-2">
                  <p className="text-xs text-neutral-600">Puntos a asignar</p>
                  <p className="text-lg font-bold text-primary-600">
                    {calculation.totalPoints} pts
                  </p>
                </Card>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Customer & Amount */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Lookup */}
            <CustomerLookup
              phone={phone}
              onPhoneChange={setPhone}
              customer={customer}
              loading={customerLoading}
              error={customerError}
              onSearch={searchCustomer}
              onClear={clearCustomer}
            />

            {/* Purchase Amount Input */}
            <PurchaseInput
              amount={amount}
              onAmountChange={setAmount}
              onClear={handleClearAmount}
              disabled={submitting}
            />

            {/* Gift Card Alert - Show when threshold will be reached */}
            {customer && willGenerateGiftCard && (
              <GiftCardAlert
                willGenerate={true}
                value={5.0}
                currentPoints={customer.total_points}
                threshold={100}
              />
            )}

            {/* Gift Card Progress - Show when close to threshold */}
            {customer && !willGenerateGiftCard && (
              <GiftCardAlert
                willGenerate={false}
                currentPoints={customer.total_points}
                threshold={100}
              />
            )}
          </div>

          {/* Right Column - Points Calculation & Actions */}
          <div className="space-y-8">
            {/* Points Calculator */}
            <PointsCalculator
              calculation={calculation}
              loading={calculationLoading}
              error={null}
            />

            {/* Action Buttons */}
            <div className="sticky top-24">
              <PosActions
                onAssign={handleAssignPoints}
                onCancel={handleCancel}
                onClear={handleClearCustomer}
                canAssign={canAssign}
                isSubmitting={submitting}
              />

              {/* Keyboard Shortcuts Hint */}
              <div className="mt-4 p-3 bg-neutral-100 rounded-lg">
                <p className="text-xs text-neutral-600 text-center">
                  <kbd className="px-2 py-1 bg-white border border-neutral-300 rounded text-xs font-mono">
                    Ctrl+Enter
                  </kbd>{' '}
                  para asignar •{' '}
                  <kbd className="px-2 py-1 bg-white border border-neutral-300 rounded text-xs font-mono">
                    Esc
                  </kbd>{' '}
                  para cancelar
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Card - Show when no customer */}
        {!customer && !customerLoading && (
          <Card className="mt-8 p-6 border-primary-600/20 bg-primary-600/5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-neutral-900 mb-2">
                  Instrucciones de uso
                </h3>
                <ol className="text-sm text-neutral-700 space-y-1 list-decimal list-inside">
                  <li>Ingrese el número de teléfono del cliente</li>
                  <li>Ingrese el monto de compra en dólares</li>
                  <li>
                    Revise los puntos calculados (incluye retos completados)
                  </li>
                  <li>Confirme la asignación de puntos</li>
                </ol>
                <p className="mt-3 text-xs text-neutral-600">
                  El cliente recibirá una confirmación por WhatsApp
                  automáticamente
                </p>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
