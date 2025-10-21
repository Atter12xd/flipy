'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser, logout } from '@/lib/auth';
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
  };
  ofertas?: any[];
}

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE_PUJAS: 'bg-yellow-100 text-yellow-800',
  ASIGNADO: 'bg-blue-100 text-blue-800',
  EN_CURSO: 'bg-purple-100 text-purple-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE_PUJAS: 'Pendiente de Pujas',
  ASIGNADO: 'Asignado',
  EN_CURSO: 'En Curso',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
  BORRADOR: 'Borrador',
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Obtener datos del usuario
    const userData = getUser();
    setUser(userData);

    // Cargar envíos
    loadEnvios();
  }, [router]);

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

  const handleLogout = () => {
    logout();
  };

  const handleCreateEnvio = () => {
    router.push('/dashboard/crear-envio');
  };

  const handleDeleteEnvio = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar este envío?')) {
      return;
    }

    try {
      setDeletingId(id);
      await enviosAPI.delete(id);
      // Recargar lista de envíos
      await loadEnvios();
    } catch (err: any) {
      alert(err.message || 'Error al cancelar envío');
    } finally {
      setDeletingId(null);
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FLIPY Dashboard</h1>
              <p className="text-sm text-gray-600">{user.tienda?.nombre || 'Panel de Tienda'}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user.email}</span>
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
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Envíos</p>
                <p className="text-2xl font-semibold text-gray-900">{envios.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {envios.filter(e => e.estado === 'PENDIENTE_PUJAS').length}
                </p>
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
                <p className="text-sm font-medium text-gray-500">Billetera</p>
                <p className="text-2xl font-semibold text-gray-900">
                  S/ {user.tienda?.billetera?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Mis Envíos</h2>
          <button
            onClick={handleCreateEnvio}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Envío
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white shadow rounded-lg p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando envíos...</p>
            </div>
          </div>
        )}

        {/* Envíos List */}
        {!loading && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {envios.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="mt-4 text-gray-500">No tienes envíos todavía</p>
                <button
                  onClick={handleCreateEnvio}
                  className="mt-4 text-blue-500 hover:text-blue-700 font-semibold"
                >
                  Crear tu primer envío
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Origen
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destino
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ofertas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {envios.map((envio) => (
                      <tr key={envio.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {getOrigenDireccion(envio.origen)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {getDestinoDireccion(envio.destino)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          S/ {envio.precio.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ESTADO_COLORS[envio.estado]}`}>
                            {ESTADO_LABELS[envio.estado]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {envio.ofertas?.length || 0} ofertas
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {envio.estado !== 'ENTREGADO' && envio.estado !== 'CANCELADO' && (
                            <button
                              onClick={() => handleDeleteEnvio(envio.id)}
                              disabled={deletingId === envio.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {deletingId === envio.id ? 'Cancelando...' : 'Cancelar'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
