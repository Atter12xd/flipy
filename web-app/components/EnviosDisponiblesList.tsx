'use client';

import { useEffect, useState } from 'react';
import { enviosAPI } from '@/lib/api';

interface Envio {
  id: string;
  origen: any;
  destino: any;
  precio: number;
  estado: string;
  detalles?: string;
  createdAt: string;
  tienda?: {
    nombre: string;
    direccion: string;
  };
  ofertas?: any[];
}

export default function EnviosDisponiblesList() {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEnvios();
  }, []);

  const loadEnvios = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await enviosAPI.getAll();
      setEnvios(response.envios || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar envíos');
      console.error('Error cargando envíos:', err);
    } finally {
      setLoading(false);
    }
  };

  const getOrigenDireccion = (origen: any) => {
    if (typeof origen === 'object' && origen.direccion) {
      return origen.direccion;
    }
    return origen || 'N/A';
  };

  const getDestinoDireccion = (destino: any) => {
    if (typeof destino === 'object' && destino.direccion) {
      return destino.direccion;
    }
    return destino || 'N/A';
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando envíos disponibles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {envios.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="mt-4 text-gray-500">No hay envíos disponibles en este momento</p>
          <button
            onClick={loadEnvios}
            className="mt-4 text-purple-500 hover:text-purple-700 font-semibold"
          >
            Recargar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {envios.map((envio) => (
            <div
              key={envio.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-900">{envio.tienda?.nombre || 'Tienda'}</h3>
                <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded">
                  S/ {envio.precio.toFixed(2)}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Origen:</p>
                  <p className="text-sm text-gray-900">{getOrigenDireccion(envio.origen)}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Destino:</p>
                  <p className="text-sm text-gray-900">{getDestinoDireccion(envio.destino)}</p>
                </div>

                {envio.detalles && (
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Detalles:</p>
                    <p className="text-sm text-gray-600">{envio.detalles}</p>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-500">
                    {envio.ofertas?.length || 0} ofertas • {new Date(envio.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button
                className="mt-4 w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
                onClick={() => alert('Función de ofertar próximamente')}
              >
                Hacer Oferta
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

