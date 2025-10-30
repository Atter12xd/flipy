'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser } from '@/lib/auth';
import { notificacionesAPI, type EstadisticasNotificaciones, type Notificacion } from '@/lib/api';

export default function NotificacionesAdminPage() {
  const router = useRouter();
  const [estadisticas, setEstadisticas] = useState<EstadisticasNotificaciones | null>(null);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userData = getUser();
    
    // Redirigir según el rol
    if (userData?.role === 'TIENDA' || userData?.role === 'MOTORIZADO') {
      console.log('Usuario no admin, redirigiendo a /notificaciones');
      router.push('/notificaciones');
      return;
    }
    
    if (userData?.role !== 'ADMIN') {
      alert('Acceso denegado. Solo administradores.');
      router.push('/dashboard');
      return;
    }

    cargarDatos();
  }, [router]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [statsRes, notifsRes] = await Promise.all([
        notificacionesAPI.getEstadisticas(),
        notificacionesAPI.getAllNotificaciones(50)
      ]);
      
      setEstadisticas(statsRes.estadisticas);
      setNotificaciones(notifsRes.notificaciones || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📱 Panel de Notificaciones</h1>
              <p className="text-gray-600 mt-1">Monitoreo de notificaciones WhatsApp</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Volver
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Enviadas</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {estadisticas.ultimas24Horas.totalEnviadas}
                  </p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Últimas 24 horas</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Fallidas</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {estadisticas.ultimas24Horas.totalFallidas}
                  </p>
                </div>
                <div className="text-4xl">❌</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Últimas 24 horas</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {estadisticas.ultimas24Horas.total}
                  </p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Últimas 24 horas</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tasa de Éxito</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {estadisticas.ultimas24Horas.tasaExito}
                  </p>
                </div>
                <div className="text-4xl">📈</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Últimas 24 horas</p>
            </div>
          </div>
        )}

        {/* Tabla de Notificaciones */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Últimas 50 Notificaciones</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destinatario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensaje</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notificaciones.map((notif) => (
                  <tr key={notif.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatearFecha(notif.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-2 text-sm">
                        {notif.tipo === 'whatsapp' ? '📱' : '📧'}
                        <span className="capitalize">{notif.tipo}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                      {notif.destinatario}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                      {notif.mensaje}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {notif.estado === 'enviada' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          ✅ Enviada
                        </span>
                      )}
                      {notif.estado === 'pendiente' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          ⏳ Pendiente
                        </span>
                      )}
                      {notif.estado === 'fallida' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          ❌ Fallida
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}




