'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, CheckCircle2, XCircle, MessageSquare, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  whatsappSettingsSchema,
  type WhatsAppSettingsFormData,
} from '@meit/shared/validators/settings';

const MESSAGE_TONES = [
  { value: 'formal', label: 'Formal' },
  { value: 'amigable', label: 'Amigable' },
  { value: 'casual', label: 'Casual' },
];

export default function WhatsAppSettingsPage() {
  const [loading, setLoading] = React.useState(false);
  const [isConnected] = React.useState(true);
  const [connectionPhone] = React.useState('+58412345678');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    watch,
  } = useForm<WhatsAppSettingsFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(whatsappSettingsSchema) as any,
    defaultValues: {
      greeting_text: 'Hola [NOMBRE]',
      signoff_text: '¡Sigue sumando!',
      message_tone: 'amigable',
      send_points_confirmation: true,
      send_expiry_reminders: true,
      expiry_reminder_days: 3,
      allowed_hours_start: '09:00',
      allowed_hours_end: '21:00',
    },
  });

  const greetingText = watch('greeting_text');
  const signoffText = watch('signoff_text');
  const sendExpiryReminders = watch('send_expiry_reminders');
  const expiryReminderDays = watch('expiry_reminder_days');

  const onSubmit = async (data: WhatsAppSettingsFormData) => {
    setLoading(true);
    try {
      // TODO: Call API to update WhatsApp settings
      console.log('Saving WhatsApp settings:', data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Configuración de WhatsApp actualizada');
    } catch (error) {
      console.error('Error saving WhatsApp settings:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleTestMessage = async () => {
    try {
      toast.info('Enviando mensaje de prueba...');
      // TODO: Call API to send test message
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Mensaje de prueba enviado correctamente');
    } catch {
      toast.error('Error al enviar mensaje de prueba');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Connection Status */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900">
              Estado de conexión
            </h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="text-sm font-medium text-neutral-900">
                    {connectionPhone}
                  </span>
                </div>
                <Badge
                  variant={isConnected ? 'success' : 'error'}
                  className="uppercase"
                >
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>
              {isConnected && (
                <p className="text-sm text-neutral-600">
                  Última actividad: Hace 2 minutos
                </p>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={handleTestMessage}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Enviar mensaje de prueba
          </Button>
        </div>
      </Card>

      {/* Settings Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personalization Section */}
          <section>
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">
              Personalización de mensajes
            </h3>
            <div className="space-y-4">
              {/* Greeting */}
              <div className="space-y-2">
                <Label htmlFor="greeting_text">Saludo</Label>
                <Input
                  {...register('greeting_text')}
                  id="greeting_text"
                  placeholder="Hola [NOMBRE]"
                  error={!!errors.greeting_text}
                />
                <p className="text-sm text-neutral-500">
                  Usa [NOMBRE] para incluir el nombre del cliente
                </p>
                {errors.greeting_text && (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.greeting_text.message}
                  </p>
                )}
              </div>

              {/* Sign-off */}
              <div className="space-y-2">
                <Label htmlFor="signoff_text">Despedida</Label>
                <Input
                  {...register('signoff_text')}
                  id="signoff_text"
                  placeholder="¡Sigue sumando!"
                  error={!!errors.signoff_text}
                />
                {errors.signoff_text && (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.signoff_text.message}
                  </p>
                )}
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <Label htmlFor="message_tone">Tono del mensaje</Label>
                <Controller
                  name="message_tone"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="message_tone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MESSAGE_TONES.map((tone) => (
                          <SelectItem key={tone.value} value={tone.value}>
                            {tone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Preview */}
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <p className="mb-2 text-xs font-medium uppercase text-neutral-600">
                  Vista previa
                </p>
                <div className="space-y-2 text-sm text-neutral-900">
                  <p>{greetingText.replace('[NOMBRE]', 'María')}</p>
                  <p>¡Has ganado 25 puntos!</p>
                  <p>Puntos acumulados: 75</p>
                  <p>{signoffText}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section>
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">
              Notificaciones
            </h3>
            <div className="space-y-4">
              {/* Welcome messages - Always ON */}
              <div className="flex items-start justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex-1">
                  <Label className="text-base font-medium">
                    Mensajes de bienvenida
                  </Label>
                  <p className="mt-1 text-sm text-neutral-600">
                    Se envían automáticamente cuando un cliente se registra
                  </p>
                </div>
                <Badge variant="default" className="uppercase">
                  Siempre activo
                </Badge>
              </div>

              {/* Points confirmation */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="send_points_confirmation" className="text-base">
                    Confirmación de puntos
                  </Label>
                  <p className="text-sm text-neutral-600">
                    Notificar al cliente cuando gane puntos
                  </p>
                </div>
                <Controller
                  name="send_points_confirmation"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      id="send_points_confirmation"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-600"
                    />
                  )}
                />
              </div>

              {/* Gift card notifications - Always ON */}
              <div className="flex items-start justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex-1">
                  <Label className="text-base font-medium">
                    Notificaciones de gift cards
                  </Label>
                  <p className="mt-1 text-sm text-neutral-600">
                    Se envían cuando el cliente recibe una gift card
                  </p>
                </div>
                <Badge variant="default" className="uppercase">
                  Siempre activo
                </Badge>
              </div>

              {/* Expiry reminders */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="send_expiry_reminders" className="text-base">
                      Recordatorios de vencimiento
                    </Label>
                    <p className="text-sm text-neutral-600">
                      Avisar antes de que expiren las gift cards
                    </p>
                  </div>
                  <Controller
                    name="send_expiry_reminders"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="send_expiry_reminders"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-600"
                      />
                    )}
                  />
                </div>

                {sendExpiryReminders && (
                  <div className="ml-0 space-y-2 rounded-lg border border-neutral-200 p-4">
                    <Label htmlFor="expiry_reminder_days">
                      Recordar con {expiryReminderDays} día
                      {expiryReminderDays !== 1 ? 's' : ''} de anticipación
                    </Label>
                    <Controller
                      name="expiry_reminder_days"
                      control={control}
                      render={({ field }) => (
                        <Slider
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          min={1}
                          max={7}
                          step={1}
                          className="w-full"
                        />
                      )}
                    />
                    <div className="flex justify-between text-xs text-neutral-600">
                      <span>1 día</span>
                      <span>7 días</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Allowed Hours Section */}
          <section>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
              <Clock className="h-5 w-5" />
              Horario permitido
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="allowed_hours_start">Hora de inicio</Label>
                <Input
                  {...register('allowed_hours_start')}
                  id="allowed_hours_start"
                  type="time"
                  error={!!errors.allowed_hours_start}
                />
                {errors.allowed_hours_start && (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.allowed_hours_start.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowed_hours_end">Hora de fin</Label>
                <Input
                  {...register('allowed_hours_end')}
                  id="allowed_hours_end"
                  type="time"
                  error={!!errors.allowed_hours_end}
                />
                {errors.allowed_hours_end && (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.allowed_hours_end.message}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Los mensajes solo se enviarán dentro de este horario
            </p>
          </section>

          {/* Limits Info */}
          <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-neutral-900">
              Límites del sistema
            </h4>
            <ul className="space-y-1 text-sm text-neutral-600">
              <li>• Máximo 3 mensajes por cliente por día</li>
              <li>• Intervalo mínimo de 2 horas entre mensajes</li>
              <li>• No se envían mensajes en días feriados nacionales</li>
            </ul>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={loading || !isDirty}
              onClick={() => window.location.reload()}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading} disabled={loading || !isDirty}>
              <Save className="mr-2 h-4 w-4" aria-hidden="true" />
              Guardar preferencias
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
