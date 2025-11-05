'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  whatsappConnectionSchema,
  type WhatsAppConnectionData,
} from '@meit/shared/validators/onboarding';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { CheckCircle2, Phone, QrCode, RefreshCw, Send } from 'lucide-react';

interface Step4WhatsAppProps {
  phone: string;
  defaultValues?: Partial<WhatsAppConnectionData>;
  onNext: (data: WhatsAppConnectionData) => void;
  onBack: () => void;
}

export function Step4WhatsApp({ phone, defaultValues, onNext, onBack }: Step4WhatsAppProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connected, setConnected] = useState(defaultValues?.connected || false);
  const [testMessageSent, setTestMessageSent] = useState(defaultValues?.testMessageSent || false);
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = useForm<WhatsAppConnectionData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(whatsappConnectionSchema) as any,
    defaultValues: defaultValues || {
      phone,
      connected: false,
      connectionMethod: 'qr',
      testMessageSent: false,
      skipped: false,
    },
  });

  const generateQRCode = async () => {
    setLoading(true);
    try {
      // Simulate QR generation (in real implementation, call Evolution API)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setQrCode('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmZmYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzAwMCIgZm9udC1zaXplPSIxOCI+Q8OzZGlnbyBRUjwvdGV4dD48L3N2Zz4=');
      // Simulate connection after QR scan
      setTimeout(() => {
        setConnected(true);
        setValue('connected', true, { shouldValidate: true });
      }, 3000);
    } catch (error) {
      console.error('Error generating QR:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    setLoading(true);
    try {
      // Simulate test message (in real implementation, call backend)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setTestMessageSent(true);
      setValue('testMessageSent', true, { shouldValidate: true });
    } catch (error) {
      console.error('Error sending test message:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: WhatsAppConnectionData) => {
    onNext({ ...data, connected, testMessageSent });
  };

  const handleSkip = () => {
    setValue('skipped', true, { shouldValidate: true });
    onNext({
      phone,
      connected: false,
      connectionMethod: 'qr',
      testMessageSent: false,
      skipped: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Conectar WhatsApp
        </h2>
        <p className="text-neutral-600">
          Conecta tu cuenta de WhatsApp Business para enviar notificaciones
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Phone Confirmation */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-neutral-600" />
            <div>
              <p className="text-sm font-medium text-neutral-900">Número de WhatsApp</p>
              <p className="text-lg font-bold text-primary-600">{phone}</p>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {!connected ? (
          <div className="space-y-6">
            {/* QR Code Section */}
            <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">
              <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Escanea el Código QR
              </h3>

              {!qrCode ? (
                <div className="text-center py-8">
                  <Button
                    type="button"
                    onClick={generateQRCode}
                    disabled={loading}
                    variant="outline"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-5 h-5 mr-2" />
                        Generar Código QR
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={qrCode}
                      alt="Código QR para WhatsApp"
                      className="w-64 h-64 border-4 border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div className="text-sm text-neutral-600 space-y-2">
                    <p className="font-medium text-center text-neutral-900 mb-3">
                      Sigue estos pasos:
                    </p>
                    <ol className="space-y-2 list-decimal list-inside">
                      <li>Abre WhatsApp en tu teléfono</li>
                      <li>Ve a Configuración → Dispositivos vinculados</li>
                      <li>Toca &quot;Vincular un dispositivo&quot;</li>
                      <li>Escanea este código QR</li>
                    </ol>
                  </div>
                  <Button
                    type="button"
                    onClick={generateQRCode}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generar Nuevo Código
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connection Success */}
            <div className="bg-success-50 border-2 border-success-300 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-success-600" />
                <div>
                  <p className="font-semibold text-success-900">
                    ¡Conectado Exitosamente!
                  </p>
                  <p className="text-sm text-success-700">
                    Tu WhatsApp Business está listo
                  </p>
                </div>
              </div>
            </div>

            {/* Test Message */}
            <div className="bg-white border-2 border-neutral-200 rounded-lg p-6">
              <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Send className="w-5 h-5" />
                Probar Conexión
              </h3>
              {!testMessageSent ? (
                <div>
                  <p className="text-sm text-neutral-600 mb-4">
                    Enviaremos un mensaje de prueba a tu WhatsApp para verificar que todo funciona correctamente.
                  </p>
                  <Button
                    type="button"
                    onClick={sendTestMessage}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Enviar Mensaje de Prueba
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-success-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <p className="text-sm font-medium">
                    Mensaje de prueba enviado correctamente
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skip Warning */}
        {!connected && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <p className="text-sm text-warning-800">
              <strong>Nota:</strong> WhatsApp es esencial para notificar a tus clientes. Si lo saltas, podrás configurarlo después en Configuración.
            </p>
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
          {!connected && (
            <Button
              type="button"
              onClick={handleSkip}
              variant="outline"
              className="order-3 sm:order-2"
            >
              Saltar por Ahora
            </Button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
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
