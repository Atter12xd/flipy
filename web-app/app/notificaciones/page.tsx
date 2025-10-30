'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser } from '@/lib/auth';
import { notificacionesAPI, type Notificacion } from '@/lib/api';
import NotificacionesLog from '@/components/NotificacionesLog';

export default function NotificacionesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userData = getUser();
    setUser(userData);
    cargarNotificaciones();
  }, [router]);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const response = await notificacionesAPI.getNotificaciones({ limite: 50 });
      setNotificaciones(response.notificaciones || []);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando notificaciones...</p>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">📱 Mis Notificaciones</h1>
              <p className="text-gray-600 mt-1">Historial de mensajes WhatsApp enviados</p>
            </div>
            <button
              onClick={() => router.push(user.role === 'TIENDA' ? '/dashboard' : '/motorizado/dashboard')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Volver al Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <p className="text-blue-900 font-medium">Notificaciones WhatsApp (Simuladas)</p>
              <p className="text-blue-700 text-sm mt-1">
                Mostrando notificaciones enviadas a tu número de teléfono registrado. 
                En modo de prueba, las notificaciones se guardan en el sistema pero no se envían realmente.
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-2xl font-bold text-gray-900">{notificaciones.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Enviadas</div>
            <div className="text-2xl font-bold text-green-600">
              {notificaciones.filter(n => n.estado === 'enviada').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Fallidas</div>
            <div className="text-2xl font-bold text-red-600">
              {notificaciones.filter(n => n.estado === 'fallida').length}
            </div>
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Historial</h2>
            <button
              onClick={cargarNotificaciones}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              🔄 Actualizar
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg mb-2">No hay notificaciones aún</p>
              <p className="text-gray-400 text-sm">
                Las notificaciones aparecerán aquí cuando se generen eventos en el sistema
              </p>
            </div>
          ) : (
            <NotificacionesLog limite={50} />
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-2">💡 Tipos de notificaciones</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Pedido creado - Cuando se crea un nuevo envío</li>
            <li>• Nueva oferta - Cuando un motorizado hace una oferta</li>
            <li>• Oferta ganada - Cuando tu oferta es aceptada</li>
            <li>• Pedido en camino - Cuando el motorizado inicia la entrega</li>
            <li>• Pedido entregado - Cuando se completa la entrega</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

