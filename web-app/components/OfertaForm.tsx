'use client';

import { useState } from 'react';
import { ofertasAPI } from '@/lib/api';

interface OfertaFormProps {
  envioId: string;
  precioBase: number;
  onSuccess?: () => void;
}

export default function OfertaForm({ envioId, precioBase, onSuccess }: OfertaFormProps) {
  const [formData, setFormData] = useState({
    precioOferta: '',
    tiempoEstimado: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Validaciones
    const precio = parseFloat(formData.precioOferta);
    const tiempo = parseInt(formData.tiempoEstimado);

    if (precio <= 0) {
      setError('El precio debe ser mayor a 0');
      setLoading(false);
      return;
    }

    if (tiempo <= 0) {
      setError('El tiempo estimado debe ser mayor a 0');
      setLoading(false);
      return;
    }

    try {
      // Conectar con API de ofertas
      await ofertasAPI.create({
        envioId,
        precioOferta: precio,
        tiempoEstimado: tiempo,
      });
      
      setSuccess(true);
      
      // Limpiar formulario
      setFormData({
        precioOferta: '',
        tiempoEstimado: '',
      });

      // Callback de éxito
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }

    } catch (err: any) {
      setError(err.message || 'Error al crear oferta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Hacer Oferta
        </h2>

        <div className="mb-4 bg-purple-50 border border-purple-200 rounded p-4">
          <p className="text-sm text-gray-600">Precio base del envío:</p>
          <p className="text-2xl font-bold text-purple-600">S/ {precioBase.toFixed(2)}</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            ¡Oferta creada exitosamente!
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="precioOferta">
            Tu Precio (S/)
          </label>
          <input
            type="number"
            id="precioOferta"
            name="precioOferta"
            value={formData.precioOferta}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="15.00"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ofrece un precio competitivo para ganar el envío
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tiempoEstimado">
            Tiempo Estimado (minutos)
          </label>
          <input
            type="number"
            id="tiempoEstimado"
            name="tiempoEstimado"
            value={formData.tiempoEstimado}
            onChange={handleChange}
            required
            min="1"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="30"
          />
          <p className="text-xs text-gray-500 mt-1">
            ¿Cuánto tiempo te tomará completar el envío?
          </p>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Enviando oferta...' : 'Enviar Oferta'}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          La tienda revisará tu oferta y podrá aceptarla
        </p>
      </form>
    </div>
  );
}

