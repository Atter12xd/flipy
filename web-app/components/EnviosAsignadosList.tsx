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
  updatedAt: string;
  tienda: {
    nombre: string;
    direccion: string;
    user: {
      email: string;
      phone: string;
    };
  };
  ofertas: Array<{
    id: string;
    precioOferta: number;
    tiempoEstimado: number;
    aceptada: boolean;
  }>;
}

export default function EnviosAsignadosList() {
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
      const response = await enviosAPI.getAsignados();
      setEnvios(response.envios || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar envíos asignados');
      console.error('Error cargando envíos asignados:', err);
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

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ASIGNADO':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'EN_CURSO':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'ENTREGADO':
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
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
        return estado;
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando envíos asignados...</p>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-gray-500">No tienes envíos asignados todavía</p>
          <p className="text-sm text-gray-400 mt-2">Cuando ganes una puja, aparecerá aquí</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {envios.map((envio) => {
            const miOferta = envio.ofertas[0]; // La oferta aceptada del motorizado
            
            return (
              <div
                key={envio.id}
                className="border-2 border-green-300 rounded-lg p-6 bg-green-50 hover:shadow-lg transition-shadow"
              >
                {/* Header con Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        ✓ ASIGNADO A TI
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${getEstadoBadge(envio.estado)}`}>
                        {getEstadoLabel(envio.estado)}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">{envio.tienda.nombre}</h3>
                    <p className="text-xs text-gray-600">{envio.tienda.direccion}</p>
                  </div>
                </div>

                {/* Información del Envío */}
                <div className="space-y-3 mb-4">
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
                </div>

                {/* Tu Oferta Aceptada */}
                {miOferta && (
                  <div className="bg-white rounded-lg p-3 mb-4 border border-green-200">
                    <p className="text-xs font-semibold text-green-800 mb-2">Tu Oferta Aceptada:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-600">Precio</p>
                        <p className="text-lg font-bold text-green-600">S/ {miOferta.precioOferta.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Tiempo</p>
                        <p className="text-lg font-semibold text-gray-800">{miOferta.tiempoEstimado} min</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Información de Contacto */}
                <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
                  <p className="text-xs font-semibold text-blue-800 mb-2">Contacto:</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-700">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {envio.tienda.user.email}
                    </div>
                    {envio.tienda.user.phone && (
                      <div className="flex items-center gap-1 text-xs text-gray-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {envio.tienda.user.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="space-y-2">
                  {envio.estado === 'ASIGNADO' && (
                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                      onClick={() => alert('Función "Iniciar Ruta" próximamente')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Iniciar Ruta
                    </button>
                  )}
                  
                  {envio.estado === 'EN_CURSO' && (
                    <button
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                      onClick={() => alert('Función "Marcar Entregado" próximamente')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Marcar como Entregado
                    </button>
                  )}

                  {envio.estado === 'ENTREGADO' && (
                    <div className="text-center py-2">
                      <span className="text-green-600 font-semibold flex items-center justify-center gap-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Envío Completado
                      </span>
                    </div>
                  )}
                </div>

                {/* Fecha */}
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs text-gray-500 text-center">
                    Actualizado: {new Date(envio.updatedAt).toLocaleDateString()} {new Date(envio.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


