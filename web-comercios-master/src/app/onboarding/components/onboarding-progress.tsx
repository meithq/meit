'use client';

import { CheckCircle2 } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
  completedSteps: number[];
}

const STEPS = [
  { number: 1, title: 'Datos del Negocio', shortTitle: 'Negocio' },
  { number: 2, title: 'Configurar Puntos', shortTitle: 'Puntos' },
  { number: 3, title: 'Retos Iniciales', shortTitle: 'Retos' },
  { number: 4, title: 'Conectar WhatsApp', shortTitle: 'WhatsApp' },
  { number: 5, title: 'QR y Prueba', shortTitle: 'QR' },
];

export function OnboardingProgress({ currentStep, completedSteps }: OnboardingProgressProps) {
  return (
    <div className="w-full" role="navigation" aria-label="Progreso del onboarding">
      {/* Mobile Progress (Compact View) */}
      <div className="block sm:hidden">
        <div className="text-center mb-4">
          <p className="text-sm font-medium text-neutral-900">
            Paso {currentStep} de 5
          </p>
          <p className="text-xs text-neutral-600 mt-1">
            {STEPS[currentStep - 1].title}
          </p>
        </div>
        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={5}
          />
        </div>
      </div>

      {/* Desktop Progress (Horizontal Stepper) */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.number);
            const isCurrent = currentStep === step.number;

            return (
              <div key={step.number} className="flex-1 flex items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`
                      relative flex items-center justify-center w-10 h-10 rounded-full
                      transition-all duration-200
                      ${
                        isCompleted
                          ? 'bg-primary-600 text-white'
                          : isCurrent
                            ? 'bg-primary-600 text-white ring-4 ring-primary-200'
                            : 'bg-neutral-300 text-neutral-600'
                      }
                    `}
                    aria-current={isCurrent ? 'step' : undefined}
                    role="listitem"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" aria-label="Completado" />
                    ) : (
                      <span className="font-semibold text-sm">{step.number}</span>
                    )}
                  </div>

                  {/* Step Title */}
                  <div className="mt-2 text-center max-w-[100px]">
                    <p
                      className={`
                        text-xs font-medium leading-tight
                        ${isCurrent ? 'text-primary-600' : isCompleted ? 'text-neutral-900' : 'text-neutral-500'}
                      `}
                    >
                      {/* Show short title on tablet, full title on desktop */}
                      <span className="hidden lg:inline">{step.title}</span>
                      <span className="inline lg:hidden">{step.shortTitle}</span>
                    </p>
                  </div>
                </div>

                {/* Connecting Line */}
                {index < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 -mt-10">
                    <div
                      className={`
                        h-full transition-colors duration-300
                        ${completedSteps.includes(step.number) ? 'bg-primary-600' : 'bg-neutral-300'}
                      `}
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Screen Reader Only Text */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Paso {currentStep} de 5: {STEPS[currentStep - 1].title}
        {completedSteps.length > 0 && `, ${completedSteps.length} pasos completados`}
      </div>
    </div>
  );
}
