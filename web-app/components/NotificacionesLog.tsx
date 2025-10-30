'use client';

import { useState, useEffect } from 'react';
import { notificacionesAPI, type Notificacion } from '@/lib/api';

interface NotificacionesLogProps {
  limite?: number;
  tipo?: string;
}

export default function NotificacionesLog({ limite = 10, tipo }: NotificacionesLogProps) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarNotificaciones();
  }, [tipo, limite]);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const response = await notificacionesAPI.getNotificaciones({ tipo, limite });
      setNotificaciones(response.notificaciones || []);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const ocultarTelefono = (telefono: string) => {
    if (telefono.length <= 8) return telefono;
    return `${telefono.substring(0, 6)} ***${telefono.substring(telefono.length - 3)}`;
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (date.toDateString() === hoy.toDateString()) {
      return `Hoy ${date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === ayer.toDateString()) {
      return `Ayer ${date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (notificaciones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        📭 No hay notificaciones aún
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notificaciones.map((notif, index) => (
        <div
          key={notif.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-3">
            {/* Icono */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              notif.tipo === 'whatsapp' ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {notif.tipo === 'whatsapp' ? (
                <span className="text-xl">📱</span>
              ) : (
                <span className="text-xl">📧</span>
              )}
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-sm font-medium text-gray-900">
                  {ocultarTelefono(notif.destinatario)}
                </div>
                <div className="flex-shrink-0">
                  {notif.estado === 'enviada' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      ✅ Enviada
                    </span>
                  )}
                  {notif.estado === 'pendiente' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      ⏳ Pendiente
                    </span>
                  )}
                  {notif.estado === 'fallida' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      ❌ Fallida
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {notif.mensaje}
              </p>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{formatearFecha(notif.createdAt)}</span>
                {notif.metadata?.tipo && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{notif.metadata.tipo.replace('_', ' ')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}




