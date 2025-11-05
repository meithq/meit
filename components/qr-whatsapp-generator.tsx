'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Download, Share2 } from 'lucide-react'
import { generateWhatsAppCheckInLink } from '@/lib/whatsapp-qr'

interface QRWhatsAppGeneratorProps {
  businessName: string
  branchName: string
  businessId?: string
  branchId?: string
  size?: number
}

export function QRWhatsAppGenerator({
  businessName,
  branchName,
  businessId,
  branchId,
  size = 300,
}: QRWhatsAppGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrUrl, setQrUrl] = useState<string>('')
  const [whatsappLink, setWhatsappLink] = useState<string>('')

  useEffect(() => {
    generateQR()
  }, [businessName, branchName, businessId, branchId])

  const generateQR = async () => {
    if (!canvasRef.current || !businessName || !branchName) return

    try {
      // Generar enlace de WhatsApp
      const link = generateWhatsAppCheckInLink({
        businessName,
        branchName,
        businessId,
        branchId,
      })

      setWhatsappLink(link)

      // Generar QR code
      await QRCode.toCanvas(canvasRef.current, link, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })

      // Convertir canvas a URL para descarga
      const url = canvasRef.current.toDataURL('image/png')
      setQrUrl(url)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const handleDownload = () => {
    if (!qrUrl) return

    const link = document.createElement('a')
    link.download = `qr-${businessName}-${branchName}.png`.replace(/\s+/g, '-')
    link.href = qrUrl
    link.click()
  }

  const handleShare = async () => {
    if (!whatsappLink) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check-in en ${businessName} - ${branchName}`,
          text: `Escanea este código QR para hacer check-in en ${businessName} (${branchName})`,
          url: whatsappLink,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(whatsappLink)
      alert('Enlace copiado al portapapeles')
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
        <canvas ref={canvasRef} />
      </div>

      <div className="text-center">
        <h3 className="font-semibold text-lg">{businessName}</h3>
        <p className="text-gray-600">{branchName}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          disabled={!qrUrl}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Descargar QR
        </button>

        <button
          onClick={handleShare}
          disabled={!whatsappLink}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 className="w-4 h-4" />
          Compartir
        </button>
      </div>

      {whatsappLink && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs font-mono break-all max-w-md">
          <p className="text-gray-500 mb-1">Enlace de WhatsApp:</p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {whatsappLink}
          </a>
        </div>
      )}
    </div>
  )
}
