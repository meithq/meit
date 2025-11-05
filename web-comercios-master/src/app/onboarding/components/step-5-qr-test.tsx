'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { qrTestSchema, type QRTestData } from '@meit/shared/validators/onboarding';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Printer,
  Store,
  CreditCard,
  Table,
  Sparkles,
} from 'lucide-react';

interface Step5QRTestProps {
  merchantId: string;
  defaultValues?: Partial<QRTestData>;
  onComplete: (data: QRTestData) => void;
  onBack: () => void;
}

export function Step5QRTest({ merchantId, defaultValues, onComplete, onBack }: Step5QRTestProps) {
  const [qrUrl] = useState(`https://meit.app/c/${merchantId}`);
  const [qrCode] = useState(
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmZmYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzgxMjc5NyIgZm9udC1zaXplPSIyNCI+TWVpdCEgUVI8L3RleHQ+PC9zdmc+'
  );
  const [testCompleted, setTestCompleted] = useState(defaultValues?.testCompleted || false);
  const [qrDownloaded, setQrDownloaded] = useState(defaultValues?.qrDownloaded || false);
  const [confetti, setConfetti] = useState(false);

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = useForm<QRTestData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(qrTestSchema) as any,
    defaultValues: defaultValues || {
      qrCode,
      qrUrl,
      testCompleted: false,
      qrDownloaded: false,
      placementConfirmed: false,
    },
  });

  const handleDownload = () => {
    // In real implementation, download high-res QR
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `meit-qr-${merchantId}.png`;
    link.click();
    setQrDownloaded(true);
    setValue('qrDownloaded', true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleTestComplete = () => {
    setTestCompleted(true);
    setValue('testCompleted', true);
  };

  const onSubmit = async (data: QRTestData) => {
    setConfetti(true);
    setTimeout(() => {
      onComplete({ ...data, testCompleted, qrDownloaded });
    }, 1000);
  };

  return (
    <div className="space-y-6 relative">
      {/* Confetti Animation */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">
            🎉
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          QR y Prueba Final
        </h2>
        <p className="text-neutral-600">
          Descarga tu código QR y realiza una prueba completa
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* QR Code Display */}
        <div className="bg-white border-2 border-primary-200 rounded-lg p-8">
          <div className="text-center space-y-4">
            <h3 className="font-semibold text-neutral-900 text-lg">
              Tu Código QR
            </h3>
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-lg border-4 border-primary-600">
                <img
                  src={qrCode}
                  alt="Código QR del comercio"
                  className="w-80 h-80"
                />
              </div>
            </div>
            <p className="text-sm text-neutral-600 font-mono">
              {qrUrl}
            </p>

            {/* Download and Print Buttons */}
            <div className="flex gap-3 justify-center pt-4">
              <Button
                type="button"
                onClick={handleDownload}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Download className="w-5 h-5" />
                Descargar QR
              </Button>
              <Button
                type="button"
                onClick={handlePrint}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Printer className="w-5 h-5" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>

        {/* Placement Instructions */}
        <div className="bg-accent-yellow/10 border border-accent-yellow/30 rounded-lg p-6">
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Store className="w-5 h-5" />
            Dónde Colocar el QR
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <Store className="w-8 h-8 mx-auto mb-2 text-primary-600" />
              <p className="text-sm font-medium text-neutral-900">En la entrada</p>
              <p className="text-xs text-neutral-600 mt-1">
                Visible al ingresar
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-primary-600" />
              <p className="text-sm font-medium text-neutral-900">En la caja</p>
              <p className="text-xs text-neutral-600 mt-1">
                Fácil de escanear
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <Table className="w-8 h-8 mx-auto mb-2 text-primary-600" />
              <p className="text-sm font-medium text-neutral-900">En mesas</p>
              <p className="text-xs text-neutral-600 mt-1">
                Para autoservicio
              </p>
            </div>
          </div>
          <p className="text-sm text-neutral-600 mt-4 text-center">
            <strong>Tamaño recomendado:</strong> Mínimo 15cm x 15cm para fácil escaneo
          </p>
        </div>

        {/* Test Flow */}
        <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Prueba el Flujo Completo
          </h3>
          <ol className="space-y-3 mb-6">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center">
                1
              </span>
              <span className="text-sm text-neutral-700 pt-0.5">
                Escanea el QR con tu teléfono
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center">
                2
              </span>
              <span className="text-sm text-neutral-700 pt-0.5">
                Envía el mensaje en WhatsApp
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center">
                3
              </span>
              <span className="text-sm text-neutral-700 pt-0.5">
                Verifica que recibes confirmación
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center">
                4
              </span>
              <span className="text-sm text-neutral-700 pt-0.5">
                ¡Listo! Ya estás registrado como cliente
              </span>
            </li>
          </ol>

          {/* Test Completion Checkbox */}
          <label className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors">
            <input
              type="checkbox"
              checked={testCompleted}
              onChange={() => handleTestComplete()}
              className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
            />
            <span className="text-sm font-medium text-neutral-900">
              He completado la prueba exitosamente
            </span>
          </label>
        </div>

        {/* Success Summary */}
        {testCompleted && (
          <div className="bg-success-50 border-2 border-success-300 rounded-lg p-6 animate-slide-up">
            <h3 className="font-semibold text-success-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              ¡Todo Listo!
            </h3>
            <div className="space-y-2 text-sm text-success-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Negocio configurado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Puntos configurados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Retos activados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>WhatsApp conectado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>QR generado</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-success-200">
              <p className="font-semibold text-success-900 mb-2">
                Próximos Pasos:
              </p>
              <ul className="space-y-1 text-sm text-success-800">
                <li>• Coloca el QR en tu negocio</li>
                <li>• Invita a tus clientes a escanear</li>
                <li>• Revisa el dashboard para ver actividad</li>
                <li>• Agrega operadores en Configuración</li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            Atrás
          </Button>
          <button
            type="submit"
            disabled={isSubmitting || !testCompleted}
            className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium text-lg
                     hover:bg-primary-700 active:bg-primary-800
                     disabled:bg-neutral-400 disabled:cursor-not-allowed
                     transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
          >
            {isSubmitting ? 'Finalizando...' : '¡Completar Configuración! 🎉'}
          </button>
        </div>
      </form>
    </div>
  );
}
