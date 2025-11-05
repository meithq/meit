'use client'

import { useState } from 'react'
import { QRWhatsAppGenerator } from '@/components/qr-whatsapp-generator'

export default function TestQRPage() {
  const [businessName, setBusinessName] = useState('Café Central')
  const [branchName, setBranchName] = useState('Sucursal Norte')

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            Generador de QR para Check-in por WhatsApp
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Formulario */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Configuración</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Negocio
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Café Central"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Sucursal
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Sucursal Norte"
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-semibold mb-2">¿Cómo funciona?</h3>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li>1. El cliente escanea el QR code</li>
                  <li>2. Se abre WhatsApp con mensaje pre-rellenado</li>
                  <li>3. El cliente envía el mensaje</li>
                  <li>4. Se registra automáticamente y se hace check-in</li>
                  <li>5. Recibe puntos y confirmación</li>
                </ol>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-semibold mb-2">Formato del mensaje:</h3>
                <div className="text-sm bg-gray-50 p-3 rounded border border-gray-200">
                  <code>
                    Hola quiero hacer checkin en {businessName} - {branchName}
                  </code>
                </div>
              </div>
            </div>

            {/* Vista previa del QR */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-center">
                Código QR Generado
              </h2>
              {businessName && branchName ? (
                <QRWhatsAppGenerator
                  businessName={businessName}
                  branchName={branchName}
                  size={300}
                />
              ) : (
                <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                  <p className="text-gray-500">
                    Ingresa el nombre del negocio y sucursal
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Consejo</h3>
            <p className="text-sm text-blue-800">
              Imprime este QR y colócalo en un lugar visible de tu sucursal. Los clientes
              podrán escanearlo para hacer check-in instantáneamente y ganar puntos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
