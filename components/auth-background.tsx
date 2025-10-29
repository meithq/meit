"use client"

import { useState, useEffect } from "react"
import { Play } from "lucide-react"

interface Slide {
  title: string
  description: string
}

interface AuthBackgroundProps {
  slides: Slide[]
}

export function AuthBackground({ slides }: AuthBackgroundProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000) // Cambiar cada 5 segundos

    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <div className="relative hidden lg:block overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1f3a 0%, #0f1629 100%)' }}>
      {/* Formas geométricas decorativas */}
      <div className="absolute inset-0">
        {/* Círculo grande púrpura */}
        <div className="absolute w-96 h-96 rounded-full opacity-40 animate-float"
          style={{
            background: 'oklch(0.5854 0.2041 277.1173)',
            top: '10%',
            left: '-10%',
            filter: 'blur(40px)',
            animationDuration: '20s',
            animationDelay: '0s'
          }}></div>

        {/* Círculo cyan */}
        <div className="absolute w-80 h-80 rounded-full opacity-40 animate-float-reverse"
          style={{
            background: 'oklch(0.8431 0.0824 180.0000)',
            top: '50%',
            right: '-5%',
            filter: 'blur(40px)',
            animationDuration: '25s',
            animationDelay: '2s'
          }}></div>

        {/* Círculo magenta */}
        <div className="absolute w-72 h-72 rounded-full opacity-30 animate-float"
          style={{
            background: 'oklch(0.4545 0.1844 321.4624)',
            bottom: '5%',
            left: '15%',
            filter: 'blur(30px)',
            animationDuration: '18s',
            animationDelay: '1s'
          }}></div>

        {/* Forma orgánica 1 */}
        <div className="absolute w-64 h-64 rounded-[40%_60%_70%_30%/60%_30%_70%_40%] opacity-20 animate-float-slow"
          style={{
            background: 'oklch(0.5106 0.2301 276.9656)',
            top: '20%',
            right: '20%',
            animationDuration: '30s',
            animationDelay: '3s'
          }}></div>

        {/* Forma orgánica 2 */}
        <div className="absolute w-56 h-56 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] opacity-20 animate-float-reverse"
          style={{
            background: 'oklch(0.7000 0.0650 180.0000)',
            bottom: '20%',
            right: '10%',
            animationDuration: '22s',
            animationDelay: '4s'
          }}></div>
      </div>

      {/* Video Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <div className="relative group">
          <div className="w-[400px] h-[250px] rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <button className="relative z-10 w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white pointer-events-auto cursor-pointer shadow-lg">
              <Play className="w-6 h-6 text-primary ml-1" fill="currentColor" />
            </button>
          </div>
          <div className="absolute -top-8 -left-8 w-16 h-16 rounded-full bg-purple-500/20 blur-xl"></div>
          <div className="absolute -bottom-8 -right-8 w-20 h-20 rounded-full bg-cyan-500/20 blur-xl"></div>
        </div>
      </div>

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-start justify-end h-full p-12">
        <div className="max-w-md">
          <div className="overflow-hidden">
            <div
              key={currentSlide}
              className="animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                {slides[currentSlide].title}
              </h2>
              <p className="text-lg text-white/80 mb-8">
                {slides[currentSlide].description}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer hover:bg-white/80 ${
                  index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -30px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 30px) scale(1.05);
          }
        }

        @keyframes float-reverse {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(-30px, 30px) scale(0.9);
          }
          50% {
            transform: translate(20px, -20px) scale(1.1);
          }
          75% {
            transform: translate(-20px, -30px) scale(1.05);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(15px, -20px) rotate(5deg);
          }
          66% {
            transform: translate(-15px, 15px) rotate(-5deg);
          }
        }

        .animate-float {
          animation: float infinite ease-in-out;
        }

        .animate-float-reverse {
          animation: float-reverse infinite ease-in-out;
        }

        .animate-float-slow {
          animation: float-slow infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}
