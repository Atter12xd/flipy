'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser, logout } from '@/lib/auth';
import { enviosAPI, suscripcionAPI, type EstadoSuscripcion } from '@/lib/api';
import EnviosDisponiblesList from '@/components/EnviosDisponiblesList';
import EnviosAsignadosList from '@/components/EnviosAsignadosList';
import BannerSuscripcionVencida from '@/components/BannerSuscripcionVencida';

export default function MotorizadoDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [estadoSuscripcion, setEstadoSuscripcion] = useState<EstadoSuscripcion | null>(null);
  const [estadisticas, setEstadisticas] = useState({
    disponibles: 0,
    asignados: 0,
    completados: 0,
  });

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated()) {
      router.push('/motorizado/login');
      return;
    }

    // Verificar que sea motorizado
    const userData = getUser();
    if (userData?.role !== 'MOTORIZADO') {
      alert('Acceso denegado. Esta área es solo para motorizados.');
      router.push('/login');
      return;
    }

    setUser(userData);
    loadEstadisticas();
    loadEstadoSuscripcion();
  }, [router]);

  const loadEstadoSuscripcion = async () => {
    try {
      const response = await suscripcionAPI.getEstado();
      setEstadoSuscripcion(response.data);
    } catch (error) {
      console.error('Error al cargar estado de suscripción:', error);
    }
  };

  const loadEstadisticas = async () => {
    try {
      // Obtener envíos disponibles y asignados
      const [disponibles, asignados] = await Promise.all([
        enviosAPI.getAll(),
        enviosAPI.getAsignados(),
      ]);

      const completados = (asignados.envios || []).filter(
        (e: any) => e.estado === 'ENTREGADO'
      ).length;

      setEstadisticas({
        disponibles: disponibles.total || 0,
        asignados: (asignados.total || 0) - completados,
        completados,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner de Suscripción Vencida */}
      {estadoSuscripcion?.bloqueado && (
        <BannerSuscripcionVencida 
          mensaje={estadoSuscripcion.mensaje}
          diasRestantes={estadoSuscripcion.diasRestantes}
        />
      )}

      {/* Header */}
      <header className={`bg-white shadow ${estadoSuscripcion?.bloqueado ? 'mt-20' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FLIPY - Panel Motorizado</h1>
              <p className="text-sm text-gray-600">Envíos Disponibles</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Badge de Estado de Suscripción */}
              {estadoSuscripcion && (
                <button
                  onClick={() => router.push('/motorizado/suscripcion')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {estadoSuscripcion.suscripcionActiva ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      ✓ Activo
                    </span>
                  ) : estadoSuscripcion.planActual === 'trial' ? (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      Trial - {estadoSuscripcion.diasRestantes}d
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      ✕ Vencido
                    </span>
                  )}
                </button>
              )}
              
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                {user.motorizado && (
                  <p className="text-xs text-gray-600">
                    {user.motorizado.vehiculo} • {user.motorizado.licencia}
                  </p>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Envíos Disponibles</p>
                <p className="text-2xl font-semibold text-gray-900">{estadisticas.disponibles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Envíos Asignados</p>
                <p className="text-2xl font-semibold text-gray-900">{estadisticas.asignados}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Envíos Completados</p>
                <p className="text-2xl font-semibold text-gray-900">{estadisticas.completados}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del Estado de Suscripción */}
        {estadoSuscripcion && estadoSuscripcion.suscripcionActiva && (
          <div className={`border rounded-lg p-4 mb-8 ${
            estadoSuscripcion.planActual === 'trial' 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <svg className={`h-5 w-5 mt-0.5 ${
                  estadoSuscripcion.planActual === 'trial' ? 'text-yellow-600' : 'text-green-600'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    estadoSuscripcion.planActual === 'trial' ? 'text-yellow-800' : 'text-green-800'
                  }`}>
                    {estadoSuscripcion.planActual === 'trial' ? 'Período de Prueba' : 'Suscripción Activa'}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    estadoSuscripcion.planActual === 'trial' ? 'text-yellow-700' : 'text-green-700'
                  }`}>
                    {estadoSuscripcion.mensaje}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/motorizado/suscripcion')}
                className={`text-sm font-medium hover:underline ${
                  estadoSuscripcion.planActual === 'trial' ? 'text-yellow-700' : 'text-green-700'
                }`}
              >
                Ver detalles →
              </button>
            </div>
          </div>
        )}

        {/* Mis Envíos Asignados */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Mis Envíos Asignados
          </h2>
          <EnviosAsignadosList />
        </div>

        {/* Lista de Envíos Disponibles */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            Envíos Disponibles para Ofertar
          </h2>
          <EnviosDisponiblesList />
        </div>
      </main>
    </div>
  );
}

