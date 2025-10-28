'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { publicAPI } from '@/lib/api';
import Link from 'next/link';

interface EnvioPublico {
  id: string;
  estado: string;
  origen: {
    direccion: string;
    lat: number;
    lng: number;
  };
  destino: {
    direccion: string;
    lat: number;
    lng: number;
  };
  ubicacionActual: {
    lat: number;
    lng: number;
    timestamp: string;
  } | null;
  tienda: {
    nombre: string;
  };
  eta: {
    mensaje: string;
    minutos: number | null;
    distanciaKm?: number;
    estado: string;
  };
  detalles: string | null;
  createdAt: string;
  updatedAt: string;
}

const estadoLabels: Record<string, string> = {
  BORRADOR: 'En preparación',
  PENDIENTE_PUJAS: 'Buscando motorizado',
  ASIGNADO: 'Motorizado asignado',
  EN_CURSO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

const estadoColors: Record<string, string> = {
  BORRADOR: 'bg-gray-100 text-gray-800',
  PENDIENTE_PUJAS: 'bg-blue-100 text-blue-800',
  ASIGNADO: 'bg-yellow-100 text-yellow-800',
  EN_CURSO: 'bg-green-100 text-green-800',
  ENTREGADO: 'bg-purple-100 text-purple-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

export default function RastreoPublicoPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [envio, setEnvio] = useState<EnvioPublico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnvio = async () => {
    try {
      setError(null);
      const response = await publicAPI.getEnvioByToken(token);
      setEnvio(response.envio);
    } catch (err: any) {
      console.error('Error obteniendo envío:', err);
      setError(err.message || 'No se pudo cargar la información del envío');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchEnvio();
    }
  }, [token]);

  // Auto-refresh cada 15 segundos
  useEffect(() => {
    if (!envio || envio.estado === 'ENTREGADO' || envio.estado === 'CANCELADO') {
      return;
    }

    const interval = setInterval(() => {
      fetchEnvio();
    }, 15000); // 15 segundos

    return () => clearInterval(interval);
  }, [envio, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando información del envío...</p>
        </div>
      </div>
    );
  }

  if (error || !envio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Envío no encontrado
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'No se encontró un envío con este código de rastreo'}
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">📦 FLIPY</h1>
          <p className="text-gray-600 text-lg">Rastrea tu pedido en tiempo real</p>
        </div>

        {/* Estado principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${estadoColors[envio.estado] || 'bg-gray-100 text-gray-800'}`}>
                {estadoLabels[envio.estado] || envio.estado}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tienda</p>
              <p className="text-lg font-semibold text-gray-800">{envio.tienda.nombre}</p>
            </div>
          </div>

          {/* ETA */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🚚</div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-800 mb-1">
                  {envio.eta.mensaje}
                </p>
                {envio.eta.distanciaKm && (
                  <p className="text-sm text-gray-600">
                    A {envio.eta.distanciaKm} km de distancia
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Ubicaciones */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Origen */}
            <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
              <div className="flex items-start gap-3">
                <div className="text-3xl">🏪</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-800 mb-1">Origen</p>
                  <p className="text-gray-700">{envio.origen.direccion}</p>
                </div>
              </div>
            </div>

            {/* Destino */}
            <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50">
              <div className="flex items-start gap-3">
                <div className="text-3xl">📍</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-800 mb-1">Destino</p>
                  <p className="text-gray-700">{envio.destino.direccion}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles */}
          {envio.detalles && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-1">Detalles del envío</p>
              <p className="text-gray-600">{envio.detalles}</p>
            </div>
          )}
        </div>

        {/* Mapa */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📍 Ubicación en tiempo real</h2>
          
          {envio.ubicacionActual ? (
            <div className="relative w-full h-96 bg-gray-100 rounded-xl overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${envio.ubicacionActual.lng - 0.01},${envio.ubicacionActual.lat - 0.01},${envio.ubicacionActual.lng + 0.01},${envio.ubicacionActual.lat + 0.01}&layer=mapnik&marker=${envio.ubicacionActual.lat},${envio.ubicacionActual.lng}`}
                allowFullScreen
              />
              <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg">
                <p className="text-xs text-gray-500">Última actualización</p>
                <p className="text-sm font-semibold text-gray-800">
                  {new Date(envio.ubicacionActual.timestamp).toLocaleTimeString('es-ES')}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-xl">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-gray-600">
                  {envio.estado === 'EN_CURSO' 
                    ? 'Esperando actualización de ubicación...'
                    : 'El motorizado aún no ha iniciado el envío'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>🔄 Actualización automática cada 15 segundos</p>
          <p className="mt-2">Código de rastreo: {token}</p>
        </div>
      </div>
    </div>
  );
}



