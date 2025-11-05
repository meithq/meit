'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingProgress } from './components/onboarding-progress';
import { Step1BusinessInfo } from './components/step-1-business-info';
import { Step2PointsConfig } from './components/step-2-points-config';
import { Step3Challenges } from './components/step-3-challenges';
import { Step4WhatsApp } from './components/step-4-whatsapp';
import { Step5QRTest } from './components/step-5-qr-test';
import {
  type BusinessInfoData,
  type PointsConfigData,
  type InitialChallengesData,
  type WhatsAppConnectionData,
  type QRTestData,
  type DraftOnboardingData,
} from '@meit/shared/validators/onboarding';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  step1?: BusinessInfoData;
  step2?: PointsConfigData;
  step3?: InitialChallengesData;
  step4?: WhatsAppConnectionData;
  step5?: QRTestData;
}

const STORAGE_KEY = 'meit-onboarding-draft';

export default function OnboardingPage() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    completedSteps: [],
  });
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [merchantId] = useState('temp-merchant-id'); // TODO: Get from auth context

  // Load draft from localStorage on mount
  useEffect(() => {
    const loadDraft = () => {
      try {
        const savedDraft = localStorage.getItem(STORAGE_KEY);
        if (savedDraft) {
          const draft: DraftOnboardingData = JSON.parse(savedDraft);
          setState({
            currentStep: draft.currentStep || 1,
            completedSteps: draft.completedSteps || [],
            step1: draft.step1 as BusinessInfoData | undefined,
            step2: draft.step2 as PointsConfigData | undefined,
            step3: draft.step3 as InitialChallengesData | undefined,
            step4: draft.step4 as WhatsAppConnectionData | undefined,
            step5: draft.step5 as QRTestData | undefined,
          });
          toast.info('Borrador cargado', {
            description: 'Continuarás donde lo dejaste',
          });
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDraft();
  }, []);

  // Save draft to localStorage whenever state changes
  useEffect(() => {
    if (!loading && hasUnsavedChanges) {
      const draft: DraftOnboardingData = {
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        step1: state.step1,
        step2: state.step2,
        step3: state.step3,
        step4: state.step4,
        step5: state.step5,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }
  }, [state, loading, hasUnsavedChanges]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const saveDraft = () => {
    const draft: DraftOnboardingData = {
      currentStep: state.currentStep,
      completedSteps: state.completedSteps,
      step1: state.step1,
      step2: state.step2,
      step3: state.step3,
      step4: state.step4,
      step5: state.step5,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    toast.success('Borrador guardado');
  };

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleStep1Complete = (data: BusinessInfoData) => {
    setState((prev) => ({
      ...prev,
      step1: data,
      currentStep: 2,
      completedSteps: [...new Set([...prev.completedSteps, 1])],
    }));
    setHasUnsavedChanges(true);
  };

  const handleStep2Complete = (data: PointsConfigData) => {
    setState((prev) => ({
      ...prev,
      step2: data,
      currentStep: 3,
      completedSteps: [...new Set([...prev.completedSteps, 2])],
    }));
    setHasUnsavedChanges(true);
  };

  const handleStep3Complete = (data: InitialChallengesData) => {
    setState((prev) => ({
      ...prev,
      step3: data,
      currentStep: 4,
      completedSteps: [...new Set([...prev.completedSteps, 3])],
    }));
    setHasUnsavedChanges(true);
  };

  const handleStep4Complete = (data: WhatsAppConnectionData) => {
    setState((prev) => ({
      ...prev,
      step4: data,
      currentStep: 5,
      completedSteps: [...new Set([...prev.completedSteps, 4])],
    }));
    setHasUnsavedChanges(true);
  };

  const handleStep5Complete = async (data: QRTestData) => {
    setState((prev) => ({
      ...prev,
      step5: data,
      completedSteps: [...new Set([...prev.completedSteps, 5])],
    }));

    // TODO: Call backend API to save complete onboarding data
    try {
      // await saveOnboardingData({ ...state, step5: data });

      // Clear draft and redirect
      clearDraft();
      setHasUnsavedChanges(false);

      toast.success('¡Onboarding completado!', {
        description: 'Redirigiendo al dashboard...',
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Error al completar el onboarding');
    }
  };

  const handleBack = (step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: step - 1,
    }));
  };

  const handleExit = () => {
    if (hasUnsavedChanges) {
      setShowExitDialog(true);
    } else {
      router.push('/dashboard');
    }
  };

  const confirmExit = () => {
    clearDraft();
    setShowExitDialog(false);
    router.push('/dashboard');
  };

  const saveAndExit = () => {
    saveDraft();
    setShowExitDialog(false);
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-teal/10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              M!
            </div>
            <h1 className="text-xl font-bold text-neutral-900">
              Configuración Inicial
            </h1>
          </div>
          <button
            onClick={handleExit}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Salir del onboarding"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <OnboardingProgress
            currentStep={state.currentStep}
            completedSteps={state.completedSteps}
          />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
          {state.currentStep === 1 && (
            <Step1BusinessInfo
              defaultValues={state.step1}
              onNext={handleStep1Complete}
            />
          )}

          {state.currentStep === 2 && state.step1 && (
            <Step2PointsConfig
              defaultValues={state.step2}
              onNext={handleStep2Complete}
              onBack={() => handleBack(2)}
            />
          )}

          {state.currentStep === 3 && state.step1 && (
            <Step3Challenges
              businessType={state.step1.type}
              defaultValues={state.step3}
              onNext={handleStep3Complete}
              onBack={() => handleBack(3)}
            />
          )}

          {state.currentStep === 4 && state.step1 && (
            <Step4WhatsApp
              phone={state.step1.phone}
              defaultValues={state.step4}
              onNext={handleStep4Complete}
              onBack={() => handleBack(4)}
            />
          )}

          {state.currentStep === 5 && (
            <Step5QRTest
              merchantId={merchantId}
              defaultValues={state.step5}
              onComplete={handleStep5Complete}
              onBack={() => handleBack(5)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-neutral-500">
          ¿Necesitas ayuda?{' '}
          <a href="/support" className="text-primary-600 hover:text-primary-700 font-medium">
            Contacta soporte
          </a>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  ¿Salir del onboarding?
                </h3>
                <p className="text-sm text-neutral-600">
                  Tienes cambios sin guardar. ¿Qué deseas hacer?
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={saveAndExit} variant="primary" className="w-full">
                Guardar borrador y salir
              </Button>
              <Button onClick={confirmExit} variant="outline" className="w-full">
                Salir sin guardar
              </Button>
              <Button
                onClick={() => setShowExitDialog(false)}
                variant="outline"
                className="w-full"
              >
                Continuar configuración
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
