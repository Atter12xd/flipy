'use client';

import { useRouter } from 'next/navigation';

interface BannerSuscripcionVencidaProps {
  mensaje?: string;
  diasRestantes?: number;
}

export default function BannerSuscripcionVencida({ 
  mensaje = 'Tu suscripción ha expirado. Renueva para seguir recibiendo ofertas.',
  diasRestantes 
}: BannerSuscripcionVencidaProps) {
  const router = useRouter();

  const handleRenovar = () => {
    router.push('/motorizado/suscripcion');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-red-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Mensaje de advertencia */}
          <div className="flex items-center gap-3 text-white">
            <div className="flex-shrink-0">
              <svg 
                className="h-6 w-6 animate-pulse" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-lg">
                ⚠️ {mensaje}
              </p>
              {diasRestantes !== undefined && diasRestantes > 0 && (
                <p className="text-sm text-red-100 mt-1">
                  Te quedan {diasRestantes} día{diasRestantes !== 1 ? 's' : ''} para renovar
                </p>
              )}
            </div>
          </div>

          {/* Botón de acción */}
          <button
            onClick={handleRenovar}
            className="flex-shrink-0 bg-white hover:bg-gray-100 text-red-600 font-bold py-2 px-6 rounded-lg shadow-md transition-all transform hover:scale-105 hover:shadow-lg"
          >
            💳 Renovar Ahora
          </button>
        </div>
      </div>
    </div>
  );
}





