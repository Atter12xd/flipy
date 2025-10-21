'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { enviosAPI } from '@/lib/api';

export default function CreateEnvioForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    precio: '',
    detalles: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Convertir direcciones de texto a objetos JSON con coordenadas
      // Por ahora usamos lat/lng en 0, más adelante integraremos Google Maps
      const envioData = {
        origen: {
          lat: 0,
          lng: 0,
          direccion: formData.origen,
          nombre: 'Origen'
        },
        destino: {
          lat: 0,
          lng: 0,
          direccion: formData.destino,
          nombre: 'Destino'
        },
        precio: parseFloat(formData.precio),
        detalles: formData.detalles || undefined,
      };

      await enviosAPI.create(envioData);
      
      setSuccess(true);
      
      // Limpiar formulario
      setFormData({
        origen: '',
        destino: '',
        precio: '',
        detalles: '',
      });

      // Redireccionar al dashboard después de 1.5 segundos
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh(); // Refrescar datos
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Error al crear envío');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Crear Nuevo Envío
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            ¡Envío creado exitosamente! Redirigiendo...
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="origen">
            Origen
          </label>
          <input
            type="text"
            id="origen"
            name="origen"
            value={formData.origen}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Av. Los Olivos 123, San Isidro"
          />
          <p className="text-gray-500 text-xs mt-1">Ingresa la dirección de origen</p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="destino">
            Destino
          </label>
          <input
            type="text"
            id="destino"
            name="destino"
            value={formData.destino}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Jr. Las Flores 456, Miraflores"
          />
          <p className="text-gray-500 text-xs mt-1">Ingresa la dirección de destino</p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="precio">
            Precio (S/)
          </label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="15.00"
          />
          <p className="text-gray-500 text-xs mt-1">Precio base del envío</p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="detalles">
            Detalles (Opcional)
          </label>
          <textarea
            id="detalles"
            name="detalles"
            value={formData.detalles}
            onChange={handleChange}
            rows={4}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Información adicional sobre el envío..."
          />
          <p className="text-gray-500 text-xs mt-1">
            Ejemplo: Paquete frágil, tocar timbre, etc.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1"
          >
            {loading ? 'Creando...' : 'Crear Envío'}
          </button>
        </div>
      </form>
    </div>
  );
}

