"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { X, AlertCircle } from "lucide-react"

interface QRScannerProps {
  onScan: (decodedText: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isRunningRef = useRef(false)
  const scannerDivId = "qr-scanner-container"
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initScanner = async () => {
      try {
        // Verificar si hay cámaras disponibles
        const devices = await Html5Qrcode.getCameras()

        if (!devices || devices.length === 0) {
          setError("No se detectó ninguna cámara en este dispositivo")
          return
        }

        // Crear instancia del escáner
        scannerRef.current = new Html5Qrcode(scannerDivId)

        // Iniciar el escáner con la cámara trasera preferida
        await scannerRef.current.start(
          { facingMode: "environment" }, // Cámara trasera
          {
            fps: 10, // Frames por segundo
            qrbox: { width: 250, height: 250 }, // Área de escaneo
          },
          (decodedText) => {
            // Cuando se detecta un código QR
            isRunningRef.current = false
            onScan(decodedText)

            // Detener el escáner
            if (scannerRef.current && scannerRef.current.isScanning) {
              scannerRef.current.stop().catch(console.error)
            }
          },
          (errorMessage) => {
            // Errores de escaneo (no hacer nada, es normal mientras busca)
          }
        )

        isRunningRef.current = true
      } catch (error) {
        console.error("Error al iniciar el escáner:", error)
        if (error instanceof Error) {
          if (error.message.includes("Permission")) {
            setError("Se necesitan permisos de cámara para escanear códigos QR")
          } else if (error.message.includes("NotFoundError")) {
            setError("No se encontró una cámara disponible")
          } else {
            setError("Error al acceder a la cámara. Intenta desde un dispositivo móvil.")
          }
        } else {
          setError("Error al iniciar el escáner")
        }
      }
    }

    initScanner()

    // Cleanup: detener el escáner cuando se desmonta el componente
    return () => {
      if (scannerRef.current && isRunningRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current = null
            isRunningRef.current = false
          })
          .catch((err) => {
            // Solo loguear si es un error diferente al "not running"
            if (!err.message?.includes("not running")) {
              console.error("Error stopping scanner:", err)
            }
            scannerRef.current = null
            isRunningRef.current = false
          })
      }
    }
  }, [onScan])

  const handleClose = () => {
    if (scannerRef.current && isRunningRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current = null
          isRunningRef.current = false
          onClose()
        })
        .catch((err) => {
          if (!err.message?.includes("not running")) {
            console.error("Error closing scanner:", err)
          }
          scannerRef.current = null
          isRunningRef.current = false
          onClose()
        })
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header con botón de cerrar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-bold">Escanear Gift Card</h2>
            <p className="text-white/70 text-sm">
              {error ? "Error al acceder a la cámara" : "Coloca el código QR dentro del marco"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Contenedor del escáner o mensaje de error */}
      <div className="flex items-center justify-center h-full p-4">
        {error ? (
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">Error de Cámara</h3>
            <p className="text-white/70 text-sm mb-6">{error}</p>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div id={scannerDivId} className="w-full max-w-md" />
        )}
      </div>

      {/* Footer con instrucciones (solo si no hay error) */}
      {!error && (
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-center text-sm">
            El código se escaneará automáticamente
          </p>
        </div>
      )}
    </div>
  )
}
