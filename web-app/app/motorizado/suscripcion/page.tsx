'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { suscripcionAPI, type EstadoSuscripcion, type PagoSuscripcion } from '@/lib/api';

export default function SuscripcionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [estadoSuscripcion, setEstadoSuscripcion] = useState<EstadoSuscripcion | null>(null);
  const [historialPagos, setHistorialPagos] = useState<PagoSuscripcion[]>([]);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<'yape' | 'tarjeta' | 'transferencia'>('tarjeta');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [mostrarConfetti, setMostrarConfetti] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [estadoRes, historialRes] = await Promise.all([
        suscripcionAPI.getEstado(),
        suscripcionAPI.getHistorial()
      ]);

      setEstadoSuscripcion(estadoRes.data);
      setHistorialPagos(historialRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
      console.error('Error al cargar datos de suscripción:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimularPago = async () => {
    try {
      setProcesandoPago(true);
      setError('');
      setExito('');

      const response = await suscripcionAPI.simularPago(metodoPagoSeleccionado);

      setExito('¡Pago procesado exitosamente! Tu suscripción está activa.');
      setMostrarConfetti(true);
      
      // Recargar datos después de 1 segundo
      setTimeout(() => {
        cargarDatos();
        setExito('');
        setMostrarConfetti(false);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago');
      console.error('Error al simular pago:', err);
    } finally {
      setProcesandoPago(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearMonto = (monto: number) => {
    return `S/ ${monto.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando tu plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50">
      {/* Confetti Effect */}
      {mostrarConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 animate-pulse">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `fall ${1 + Math.random() * 2}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/motorizado/dashboard')}
            className="text-purple-600 hover:text-purple-700 flex items-center gap-2 mb-6 transition-colors"
          >
            ← Volver al Dashboard
          </button>
        </div>

        {/* Banner de Modo Demo */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-800 text-center">
            💡 <span className="font-semibold">Modo Demo:</span> Los pagos son simulados para testing
          </p>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 rounded-2xl shadow-2xl p-8 sm:p-12 mb-8 text-white text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Impulsa tu negocio con FLIPY Pro ✨
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Acceso ilimitado a ofertas y ganancias sin límite
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">1,500+</div>
              <div className="text-purple-100 text-sm">Motorizados activos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">S/ 2.5M</div>
              <div className="text-purple-100 text-sm">Procesados este mes</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">⭐ 4.8</div>
              <div className="text-purple-100 text-sm">Calificación promedio</div>
            </div>
          </div>
        </div>

        {/* Badge de Estado Grande */}
        {estadoSuscripcion && (
          <div className="mb-8 text-center">
            {estadoSuscripcion.suscripcionActiva ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-full text-lg font-semibold shadow-lg">
                ✓ SUSCRIPCIÓN ACTIVA
              </div>
            ) : estadoSuscripcion.planActual === 'trial' && estadoSuscripcion.diasRestantes > 0 ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-100 text-yellow-800 rounded-full text-lg font-semibold shadow-lg animate-pulse">
                🎁 TRIAL - {estadoSuscripcion.diasRestantes} días gratis
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-100 text-red-800 rounded-full text-lg font-semibold shadow-lg animate-pulse">
                ⚠️ VENCIDA - Renueva ahora
              </div>
            )}
          </div>
        )}

        {/* Plan Card - Estilo Premium */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-3xl">
            {/* Badge "Popular" */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-bl-2xl font-semibold text-sm">
              ⭐ MÁS ELEGIDO
            </div>

            <div className="p-8 sm:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Plan Mensual FLIPY Pro</h2>
                <div className="mb-4">
                  <span className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    S/ 110
                  </span>
                  <span className="text-2xl text-gray-500">/mes</span>
                </div>
                <p className="text-lg text-gray-600">(≈ $29 USD)</p>
                <p className="text-sm text-gray-500 mt-2">7 días de prueba gratis incluidos</p>
              </div>

              {/* Beneficios */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                  <div>
                    <div className="font-semibold text-gray-900">7 días de prueba gratis</div>
                    <div className="text-sm text-gray-600">Prueba sin compromiso</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                  <div>
                    <div className="font-semibold text-gray-900">Ofertas ilimitadas</div>
                    <div className="text-sm text-gray-600">Participa en todos los envíos disponibles</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                  <div>
                    <div className="font-semibold text-gray-900">Soporte prioritario 24/7</div>
                    <div className="text-sm text-gray-600">Asistencia rápida cuando la necesites</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                  <div>
                    <div className="font-semibold text-gray-900">Dashboard analytics</div>
                    <div className="text-sm text-gray-600">Estadísticas detalladas de tus envíos</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                  <div>
                    <div className="font-semibold text-gray-900">Sin comisiones ocultas</div>
                    <div className="text-sm text-gray-600">Todo lo que ganes es tuyo</div>
                  </div>
                </div>
              </div>

              {/* Potencial de Ganancias */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Potencial de ganancias</p>
                <p className="text-3xl font-bold text-green-600">Hasta S/ 3,000/mes</p>
                <p className="text-sm text-gray-500 mt-2">Basado en promedio de motorizados activos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Métodos de Pago */}
        {estadoSuscripcion?.bloqueado !== false && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Selecciona tu método de pago
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-center">{error}</p>
              </div>
            )}

            {exito && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-center font-semibold">{exito}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {/* Tarjeta */}
              <label className={`relative cursor-pointer group ${metodoPagoSeleccionado === 'tarjeta' ? 'ring-4 ring-green-500' : ''}`}>
                <input
                  type="radio"
                  name="metodoPago"
                  value="tarjeta"
                  checked={metodoPagoSeleccionado === 'tarjeta'}
                  onChange={(e) => setMetodoPagoSeleccionado(e.target.value as any)}
                  className="sr-only"
                />
                <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg transition-all duration-200 bg-white group-hover:bg-purple-50">
                  <div className="text-center">
                    <div className="text-4xl mb-3">💳</div>
                    <div className="font-bold text-gray-900 mb-2">Tarjeta</div>
                    <div className="text-xs text-gray-500 mb-2">Visa • Mastercard</div>
                    <div className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Seguro
                    </div>
                  </div>
                </div>
                {metodoPagoSeleccionado === 'tarjeta' && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    ✓
                  </div>
                )}
              </label>

              {/* Yape */}
              <label className={`relative cursor-pointer group ${metodoPagoSeleccionado === 'yape' ? 'ring-4 ring-green-500' : ''}`}>
                <input
                  type="radio"
                  name="metodoPago"
                  value="yape"
                  checked={metodoPagoSeleccionado === 'yape'}
                  onChange={(e) => setMetodoPagoSeleccionado(e.target.value as any)}
                  className="sr-only"
                />
                <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg transition-all duration-200 bg-white group-hover:bg-purple-50">
                  <div className="text-center">
                    <div className="text-4xl mb-3">📱</div>
                    <div className="font-bold text-gray-900 mb-2">Yape</div>
                    <div className="text-xs text-gray-500 mb-2">Pago móvil</div>
                    <div className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      Instantáneo
                    </div>
                  </div>
                </div>
                {metodoPagoSeleccionado === 'yape' && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    ✓
                  </div>
                )}
              </label>

              {/* Transferencia */}
              <label className={`relative cursor-pointer group ${metodoPagoSeleccionado === 'transferencia' ? 'ring-4 ring-green-500' : ''}`}>
                <input
                  type="radio"
                  name="metodoPago"
                  value="transferencia"
                  checked={metodoPagoSeleccionado === 'transferencia'}
                  onChange={(e) => setMetodoPagoSeleccionado(e.target.value as any)}
                  className="sr-only"
                />
                <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg transition-all duration-200 bg-white group-hover:bg-purple-50">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🏦</div>
                    <div className="font-bold text-gray-900 mb-2">Transferencia</div>
                    <div className="text-xs text-gray-500 mb-2">Bancaria</div>
                    <div className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Seguro
                    </div>
                  </div>
                </div>
                {metodoPagoSeleccionado === 'transferencia' && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    ✓
                  </div>
                )}
              </label>
            </div>

            {/* Botón de Pago */}
            <button
              onClick={handleSimularPago}
              disabled={procesandoPago}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:scale-100 text-lg"
            >
              {procesandoPago ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Procesando pago...
                </span>
              ) : (
                '🚀 Activar Suscripción Ahora - S/ 110'
              )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              🔒 Pago seguro y encriptado • Cancela cuando quieras
            </p>
          </div>
        )}

        {/* Historial de Pagos */}
        {historialPagos.length > 0 && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Historial de Pagos</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historialPagos.slice(0, 5).map((pago, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatearFecha(pago.fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatearMonto(pago.monto)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className="flex items-center gap-2">
                          {pago.metodoPago === 'yape' && '📱'}
                          {pago.metodoPago === 'tarjeta' && '💳'}
                          {pago.metodoPago === 'transferencia' && '🏦'}
                          {pago.metodoPago.charAt(0).toUpperCase() + pago.metodoPago.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          ✓ {pago.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
