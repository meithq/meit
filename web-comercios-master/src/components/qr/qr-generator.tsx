'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Branch } from '@/types/database'

interface QRGeneratorProps {
  branch: Branch
  merchantName: string
}

/**
 * QR Code Generator Component
 *
 * Generates a WhatsApp deep link QR code for customer check-in
 * Format: https://wa.me/[PHONE]?text=Hola!%20Quiero%20registrarme%20en%20[BRANCH_CODE]
 */
export function QRGenerator({ branch, merchantName }: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Get WhatsApp number from env or use default
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+584121234567'

  useEffect(() => {
    if (!branch || !canvasRef.current) return

    const generateQR = async () => {
      try {
        // Create WhatsApp deep link with pre-filled message
        const message = `Hola! Quiero registrarme en ${branch.qr_code}`
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

        // Generate QR code on canvas
        await QRCode.toCanvas(canvasRef.current, whatsappLink, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        })

        // Also generate data URL for download
        const dataUrl = await QRCode.toDataURL(whatsappLink, {
          width: 600,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        })

        setQrDataUrl(dataUrl)
        setError(null)
      } catch (err) {
        console.error('Error generating QR code:', err)
        setError('Failed to generate QR code')
      }
    }

    generateQR()
  }, [branch, whatsappNumber])

  const handleDownload = () => {
    if (!qrDataUrl) return

    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `QR_${branch.name.replace(/\s+/g, '_')}_${branch.qr_code}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    if (!qrDataUrl) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Código QR - ${branch.name}</title>
          <style>
            @media print {
              @page {
                margin: 20mm;
              }
            }
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            h1 {
              color: #812797;
              font-size: 24px;
              margin-bottom: 10px;
            }
            h2 {
              color: #606060;
              font-size: 18px;
              margin-bottom: 20px;
            }
            .qr-container {
              margin: 30px auto;
              max-width: 400px;
            }
            img {
              width: 100%;
              max-width: 400px;
              height: auto;
            }
            .instructions {
              margin-top: 30px;
              font-size: 14px;
              color: #606060;
              text-align: left;
              max-width: 400px;
              margin-left: auto;
              margin-right: auto;
            }
            .instructions h3 {
              color: #812797;
              font-size: 16px;
              margin-bottom: 10px;
            }
            .instructions ol {
              margin-left: 20px;
            }
            .instructions li {
              margin-bottom: 8px;
            }
            .code-display {
              margin-top: 20px;
              padding: 15px;
              background-color: #f5f5f5;
              border-radius: 8px;
              font-family: monospace;
              font-size: 16px;
              color: #812797;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <h1>${merchantName}</h1>
          <h2>${branch.name}</h2>

          <div class="qr-container">
            <img src="${qrDataUrl}" alt="Código QR" />
          </div>

          <div class="code-display">
            Código: ${branch.qr_code}
          </div>

          <div class="instructions">
            <h3>📱 ¿Cómo usar este código QR?</h3>
            <ol>
              <li>Abre la cámara de tu teléfono</li>
              <li>Apunta al código QR</li>
              <li>Toca la notificación que aparece</li>
              <li>Se abrirá WhatsApp con un mensaje pre-escrito</li>
              <li>Envía el mensaje para registrarte</li>
            </ol>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    // Wait for image to load before printing
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  if (error) {
    return (
      <div className="rounded-lg border border-error-200 bg-error-50 p-4 text-sm text-error-700">
        <p className="font-medium">Error al generar código QR</p>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* QR Code Display */}
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-lg border-2 border-neutral-200 bg-white p-6">
          <canvas ref={canvasRef} />
        </div>

        {/* Branch Info */}
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-900">{branch.name}</p>
          <p className="text-xs text-neutral-600 font-mono">{branch.qr_code}</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border border-info-200 bg-info-50 p-4 text-sm">
        <h4 className="font-medium text-info-900 mb-2">📱 Instrucciones para clientes:</h4>
        <ol className="list-decimal list-inside space-y-1 text-info-800">
          <li>Escanear el código QR con la cámara del teléfono</li>
          <li>Se abrirá WhatsApp con un mensaje pre-escrito</li>
          <li>Enviar el mensaje para registrarse</li>
          <li>Recibir confirmación y empezar a acumular puntos</li>
        </ol>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleDownload}
          className="flex-1 gap-2"
          disabled={!qrDataUrl}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Descargar PNG
        </Button>

        <Button
          onClick={handlePrint}
          variant="outline"
          className="flex-1 gap-2"
          disabled={!qrDataUrl}
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          Imprimir
        </Button>
      </div>

      {/* Placement Tips */}
      <div className="rounded-lg border border-warning-200 bg-warning-50 p-4 text-sm">
        <h4 className="font-medium text-warning-900 mb-2">💡 Dónde colocar el código QR:</h4>
        <ul className="list-disc list-inside space-y-1 text-warning-800">
          <li>En la entrada del local (visible desde afuera)</li>
          <li>En la caja registradora</li>
          <li>En las mesas (para restaurantes)</li>
          <li>En el mostrador de atención al cliente</li>
        </ul>
        <p className="mt-2 text-xs text-warning-700">
          <strong>Tip:</strong> Imprímelo en tamaño A4 para mejor visibilidad
        </p>
      </div>
    </div>
  )
}
