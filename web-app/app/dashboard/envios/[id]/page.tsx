'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { enviosAPI, ofertasAPI } from '@/lib/api';

interface Oferta {
  id: string;
  precioOferta: number;
  tiempoEstimado: number;
  aceptada: boolean;
  createdAt: string;
  motorizado: {
    licencia: string;
    vehiculo: string;
    user: {
      email: string;
      phone: string;
    };
  };
}

interface Envio {
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
  detalles?: string;
  estado: string;
  createdAt: string;
}

export default function EnvioDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [envio, setEnvio] = useState<Envio | null>(null);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aceptandoOferta, setAceptandoOferta] = useState<string | null>(null);

  const fetchData = async (envioId: string) => {
    try {
      setLoading(true);
      setError('');

      console.log('=== INICIANDO CARGA DE DATOS ===');
      console.log('ID del envío:', envioId);
      console.log('URL completa del envío:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/envios/${envioId}`);

      // Obtener datos del envío y las ofertas en paralelo
      const [envioData, ofertasData] = await Promise.all([
        enviosAPI.getById(envioId),
        ofertasAPI.getByEnvio(envioId),
      ]);

      console.log('=== RESPUESTA DEL SERVIDOR ===');
      console.log('Envío completo:', JSON.stringify(envioData, null, 2));
      console.log('Ofertas completo:', JSON.stringify(ofertasData, null, 2));
      
      console.log('=== EXTRAYENDO DATA ===');
      console.log('envioData.data:', envioData.data);
      console.log('envioData.success:', envioData.success);
      console.log('ofertasData.data:', ofertasData.data);
      console.log('ofertasData.success:', ofertasData.success);

      if (!envioData.data) {
        throw new Error('El servidor no retornó datos del envío');
      }

      setEnvio(envioData.data);
      setOfertas(ofertasData.data || []);
      
      console.log('=== DATOS CARGADOS EXITOSAMENTE ===');
    } catch (err: any) {
      console.error('=== ERROR AL CARGAR DATOS ===');
      console.error('Error completo:', err);
      console.error('Mensaje de error:', err.message);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      console.log('Ejecutando fetchData con ID:', params.id);
      fetchData(params.id);
    }
  }, [params?.id]);

  const handleAceptarOferta = async (ofertaId: string) => {
    if (!confirm('¿Estás seguro de aceptar esta oferta? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setAceptandoOferta(ofertaId);
      await ofertasAPI.accept(ofertaId);
      
      // Recargar datos
      if (params?.id) {
        await fetchData(params.id);
      }
      
      alert('¡Oferta aceptada exitosamente!');
    } catch (err: any) {
      alert(err.message || 'Error al aceptar oferta');
    } finally {
      setAceptandoOferta(null);
    }
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE_PUJAS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ASIGNADO':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'EN_CURSO':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ENTREGADO':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
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
                onClick={() => router.push('/dashboard')}
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

  const ofertaAceptada = ofertas.find(o => o.aceptada);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-2"
          >
            ← Volver al Dashboard
          </button>
          <span className={`px-4 py-2 rounded-full border font-semibold text-sm ${getEstadoBadgeColor(envio.estado)}`}>
            {envio.estado.replace('_', ' ')}
          </span>
        </div>

        {/* Información del Envío */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Detalle del Envío</h1>
          
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
              {envio.origen.nombre && (
                <p className="font-semibold text-gray-800">{envio.origen.nombre}</p>
              )}
              <p className="text-gray-600 text-sm">{envio.origen.direccion}</p>
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
              {envio.destino.nombre && (
                <p className="font-semibold text-gray-800">{envio.destino.nombre}</p>
              )}
              <p className="text-gray-600 text-sm">{envio.destino.direccion}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Precio Base</p>
              <p className="text-3xl font-bold text-purple-600">S/ {envio.precio.toFixed(2)}</p>
            </div>
            {envio.detalles && (
              <div>
                <p className="text-gray-600 text-sm mb-1">Detalles</p>
                <p className="text-gray-800">{envio.detalles}</p>
              </div>
            )}
          </div>
        </div>

        {/* Ofertas Recibidas */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Ofertas Recibidas ({ofertas.length})
          </h2>

          {ofertas.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-lg">Aún no hay ofertas para este envío</p>
              <p className="text-gray-400 text-sm mt-2">Los motorizados verán tu envío y podrán hacer ofertas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ofertas.map((oferta) => (
                <div
                  key={oferta.id}
                  className={`border rounded-lg p-6 transition-all ${
                    oferta.aceptada
                      ? 'bg-green-50 border-green-300 shadow-md'
                      : 'bg-white border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {oferta.aceptada && (
                          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            ✓ Aceptada
                          </span>
                        )}
                        <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {oferta.motorizado.vehiculo}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-gray-600 text-sm">Precio Ofertado</p>
                          <p className="text-2xl font-bold text-purple-600">S/ {oferta.precioOferta.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Tiempo Estimado</p>
                          <p className="text-xl font-semibold text-gray-800">{oferta.tiempoEstimado} min</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Licencia</p>
                          <p className="text-sm font-mono text-gray-800">{oferta.motorizado.licencia}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {oferta.motorizado.user.email}
                        </div>
                        {oferta.motorizado.user.phone && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {oferta.motorizado.user.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    {!ofertaAceptada && envio.estado === 'PENDIENTE_PUJAS' && (
                      <button
                        onClick={() => handleAceptarOferta(oferta.id)}
                        disabled={aceptandoOferta === oferta.id}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-4"
                      >
                        {aceptandoOferta === oferta.id ? 'Aceptando...' : 'Aceptar'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

