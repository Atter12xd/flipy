'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { enviosAPI } from '@/lib/api';
import MapaTracking from '@/components/MapaTracking';

interface EnvioBasico {
  id: string;
  origen: {
    direccion: string;
    nombre?: string;
  };
  destino: {
    direccion: string;
    nombre?: string;
  };
  precio: number;
  estado: string;
  detalles?: string;
}

export default function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const envioId = resolvedParams.id;
  
  const router = useRouter();
  const [envio, setEnvio] = useState<EnvioBasico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEnvio = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await enviosAPI.getById(envioId);
        
        if (response.success && response.data) {
          setEnvio(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar envío');
      } finally {
        setLoading(false);
      }
    };

    if (envioId) {
      loadEnvio();
    }
  }, [envioId]);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ASIGNADO':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'EN_CURSO':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'ENTREGADO':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'ASIGNADO':
        return 'Asignado';
      case 'EN_CURSO':
        return 'En Curso';
      case 'ENTREGADO':
        return 'Entregado';
      default:
        return estado.replace('_', ' ');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando información del envío...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !envio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
              <p className="text-gray-600 mb-4">{error || 'Envío no encontrado'}</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors"
              >
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <button
            onClick={() => router.push(`/dashboard/envios/${envioId}`)}
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Detalles
          </button>
          
          <span className={`px-4 py-2 rounded-full border font-semibold text-sm ${getEstadoBadge(envio.estado)}`}>
            {getEstadoLabel(envio.estado)}
          </span>
        </div>

        {/* Info del Envío */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Tracking en Tiempo Real
          </h1>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 font-semibold mb-1">Origen</p>
              {envio.origen.nombre && (
                <p className="font-semibold text-gray-800">{envio.origen.nombre}</p>
              )}
              <p className="text-gray-700">{envio.origen.direccion}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 font-semibold mb-1">Destino</p>
              {envio.destino.nombre && (
                <p className="font-semibold text-gray-800">{envio.destino.nombre}</p>
              )}
              <p className="text-gray-700">{envio.destino.direccion}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 font-semibold mb-1">Precio</p>
              <p className="text-2xl font-bold text-purple-600">S/ {envio.precio.toFixed(2)}</p>
            </div>
          </div>

          {envio.detalles && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500 font-semibold mb-1">Detalles del envío</p>
              <p className="text-gray-700">{envio.detalles}</p>
            </div>
          )}
        </div>

        {/* Mapa de Tracking */}
        {(envio.estado === 'ASIGNADO' || envio.estado === 'EN_CURSO' || envio.estado === 'ENTREGADO') ? (
          <MapaTracking envioId={envioId} mostrarControles={true} />
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold">Tracking no disponible</p>
                <p className="text-sm">El tracking estará disponible cuando el motorizado inicie la entrega.</p>
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

