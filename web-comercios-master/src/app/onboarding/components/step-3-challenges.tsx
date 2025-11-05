'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  initialChallengesSchema,
  type InitialChallengesData,
  type BusinessType,
  type ChallengeTemplate,
  getChallengeTemplatesByType,
} from '@meit/shared/validators/onboarding';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { CheckCircle2, Circle, MessageSquare } from 'lucide-react';

interface Step3ChallengesProps {
  businessType: BusinessType;
  defaultValues?: Partial<InitialChallengesData>;
  onNext: (data: InitialChallengesData) => void;
  onBack: () => void;
}

export function Step3Challenges({ businessType, defaultValues, onNext, onBack }: Step3ChallengesProps) {
  const templates = getChallengeTemplatesByType(businessType);
  const [selectedChallenges, setSelectedChallenges] = useState<ChallengeTemplate[]>(
    defaultValues?.selectedChallenges || []
  );
  const [skipped, setSkipped] = useState(defaultValues?.skipped || false);

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
  } = useForm<InitialChallengesData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(initialChallengesSchema) as any,
    defaultValues: defaultValues || {
      selectedChallenges: [],
      skipped: false,
    },
  });

  const toggleChallenge = (challenge: ChallengeTemplate) => {
    const isSelected = selectedChallenges.some((c) => c.id === challenge.id);

    if (isSelected) {
      const updated = selectedChallenges.filter((c) => c.id !== challenge.id);
      setSelectedChallenges(updated);
      setValue('selectedChallenges', updated, { shouldValidate: true });
    } else if (selectedChallenges.length < 3) {
      const updated = [...selectedChallenges, challenge];
      setSelectedChallenges(updated);
      setValue('selectedChallenges', updated, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: InitialChallengesData) => {
    onNext({ ...data, selectedChallenges, skipped });
  };

  const handleSkip = () => {
    setValue('skipped', true, { shouldValidate: true });
    setSkipped(true);
    onNext({ selectedChallenges: [], skipped: true });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Retos Iniciales
        </h2>
        <p className="text-neutral-600">
          Selecciona 2-3 retos para incentivar a tus clientes
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Selection Counter */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-primary-900">
            {selectedChallenges.length}/3 retos seleccionados
          </p>
          {selectedChallenges.length < 2 && !skipped && (
            <p className="text-xs text-primary-700 mt-1">
              Selecciona al menos 2 retos
            </p>
          )}
        </div>

        {/* Challenge Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((challenge) => {
            const isSelected = selectedChallenges.some((c) => c.id === challenge.id);
            const isDisabled = !isSelected && selectedChallenges.length >= 3;

            return (
              <button
                key={challenge.id}
                type="button"
                onClick={() => toggleChallenge(challenge)}
                disabled={isDisabled}
                className={`
                  relative p-4 rounded-lg border-2 text-left transition-all
                  ${
                    isSelected
                      ? 'border-primary-600 bg-primary-50'
                      : isDisabled
                        ? 'border-neutral-200 bg-neutral-50 opacity-50 cursor-not-allowed'
                        : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-primary-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-neutral-900 mb-1">
                      {challenge.name}
                    </h4>
                    {challenge.description && (
                      <p className="text-sm text-neutral-600 mb-2">
                        {challenge.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                        {challenge.points} puntos
                      </span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Preview */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-primary-200">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-primary-800">
                        <p className="font-medium mb-1">Vista previa en WhatsApp:</p>
                        <p className="italic">
                          • {challenge.name} {challenge.description && `(${challenge.description})`} - {challenge.points} pts
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {errors.selectedChallenges && (
          <p className="text-sm text-error-600 text-center" role="alert">
            {errors.selectedChallenges.message}
          </p>
        )}

        {/* WhatsApp Message Preview */}
        {selectedChallenges.length > 0 && (
          <div className="bg-accent-teal/10 border border-accent-teal/30 rounded-lg p-6">
            <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Mensaje de WhatsApp
            </h4>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-neutral-800 whitespace-pre-line font-mono">
                {`¡Hola [Cliente]! 🎉\n\nTus retos de hoy:\n${selectedChallenges.map((c) => `• ${c.name} ${c.description ? `(${c.description})` : ''} - ${c.points} pts`).join('\n')}\n\n¡Acumula puntos y gana recompensas!`}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="order-2 sm:order-1"
          >
            Atrás
          </Button>
          <Button
            type="button"
            onClick={handleSkip}
            variant="outline"
            className="order-3 sm:order-2"
          >
            Saltar Este Paso
          </Button>
          <button
            type="submit"
            disabled={isSubmitting || (selectedChallenges.length < 2 && !skipped)}
            className="order-1 sm:order-3 flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium
                     hover:bg-primary-700 active:bg-primary-800
                     disabled:bg-neutral-400 disabled:cursor-not-allowed
                     transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
          >
            {isSubmitting ? 'Guardando...' : 'Continuar'}
          </button>
        </div>
      </form>
    </div>
  );
}
