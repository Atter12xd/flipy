'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { enviosAPI, trackingAPI } from '@/lib/api';
import MapaTracking from '@/components/MapaTracking';
import EvidenciasForm from '@/components/EvidenciasForm';

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

export default function EnvioMotorizadoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const envioId = resolvedParams.id;
  
  const router = useRouter();
  const [envio, setEnvio] = useState<Envio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [actualizandoUbicacion, setActualizandoUbicacion] = useState(false);

  useEffect(() => {
    loadEnvio();
  }, [envioId]);

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

  const handleCambiarEstado = async (nuevoEstado: string) => {
    if (!confirm(`¿Confirmas que deseas cambiar el estado a ${nuevoEstado}?`)) {
      return;
    }

    try {
      setCambiandoEstado(true);
      await trackingAPI.cambiarEstado(envioId, nuevoEstado);
      
      // Recargar envío
      await loadEnvio();
      
      alert(`Estado cambiado a ${nuevoEstado} exitosamente`);
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado');
    } finally {
      setCambiandoEstado(false);
    }
  };

  const handleSimularUbicacion = async () => {
    if (!envio) return;

    // Simular ubicación entre origen y destino
    const origen = envio.origen;
    const destino = envio.destino;
    
    // Calcular punto intermedio (simulado)
    const lat = (origen.lat + destino.lat) / 2 + (Math.random() - 0.5) * 0.01;
    const lng = (origen.lng + destino.lng) / 2 + (Math.random() - 0.5) * 0.01;

    try {
      setActualizandoUbicacion(true);
      await trackingAPI.updateUbicacion(envioId, { lat, lng });
      
      alert('Ubicación actualizada exitosamente');
    } catch (err: any) {
      alert(err.message || 'Error al actualizar ubicación');
    } finally {
      setActualizandoUbicacion(false);
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
        return 'bg-green-100 text-green-800 border-green-300';
      case 'EN_CURSO':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ENTREGADO':
        return 'bg-gray-100 text-gray-800 border-gray-300';
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
        return estado;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando envío...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !envio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
              <p className="text-gray-600 mb-4">{error || 'Envío no encontrado'}</p>
              <button
                onClick={() => router.push('/motorizado/dashboard')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded transition-colors"
              >
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const miOferta = envio.ofertas[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <button
            onClick={() => router.push('/motorizado/dashboard')}
            className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Dashboard
          </button>
          
          <span className={`px-4 py-2 rounded-full border font-semibold text-sm ${getEstadoBadge(envio.estado)}`}>
            {getEstadoLabel(envio.estado)}
          </span>
        </div>

        {/* Info del Envío */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Envío Asignado</h1>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Origen */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Origen
              </h3>
              <p className="text-gray-900">{getOrigenDireccion(envio.origen)}</p>
            </div>

            {/* Destino */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Destino
              </h3>
              <p className="text-gray-900">{getDestinoDireccion(envio.destino)}</p>
            </div>
          </div>

          {/* Tu Oferta Aceptada */}
          {miOferta && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-xs font-semibold text-green-800 mb-2">TU OFERTA ACEPTADA:</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Precio</p>
                  <p className="text-2xl font-bold text-green-600">S/ {miOferta.precioOferta.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Tiempo Estimado</p>
                  <p className="text-2xl font-semibold text-gray-800">{miOferta.tiempoEstimado} min</p>
                </div>
              </div>
            </div>
          )}

          {/* Info de contacto */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-800 mb-2">CONTACTO TIENDA:</p>
            <p className="font-semibold text-gray-800 mb-1">{envio.tienda.nombre}</p>
            <div className="space-y-1 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {envio.tienda.user.email}
              </div>
              {envio.tienda.user.phone && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {envio.tienda.user.phone}
                </div>
              )}
            </div>
          </div>

          {envio.detalles && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500 font-semibold mb-1">Detalles:</p>
              <p className="text-gray-700">{envio.detalles}</p>
            </div>
          )}
        </div>

        {/* Mapa */}
        {(envio.estado === 'ASIGNADO' || envio.estado === 'EN_CURSO') && (
          <div className="mb-6">
            <MapaTracking envioId={envioId} mostrarControles={true} />
          </div>
        )}

        {/* Evidencias de Entrega - Solo cuando está EN_CURSO */}
        {envio.estado === 'EN_CURSO' && (
          <div className="mb-6">
            <EvidenciasForm envioId={envioId} onSuccess={loadEnvio} />
          </div>
        )}

        {/* Controles del Motorizado */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Controles del Envío</h2>

          {/* Simular Ubicación GPS */}
          {(envio.estado === 'ASIGNADO' || envio.estado === 'EN_CURSO') && (
            <div className="mb-4">
              <button
                onClick={handleSimularUbicacion}
                disabled={actualizandoUbicacion}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {actualizandoUbicacion ? 'Actualizando...' : 'Actualizar Mi Ubicación (Simulado)'}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                En producción, usará GPS real del dispositivo
              </p>
            </div>
          )}

          {/* Cambiar Estado */}
          <div className="space-y-3">
            {envio.estado === 'ASIGNADO' && (
              <button
                onClick={() => handleCambiarEstado('EN_CURSO')}
                disabled={cambiandoEstado}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                {cambiandoEstado ? 'Cambiando...' : 'Iniciar Entrega'}
              </button>
            )}

            {envio.estado === 'ENTREGADO' && (
              <div className="text-center py-4">
                <span className="text-green-600 font-semibold flex items-center justify-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ¡Envío Completado!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

