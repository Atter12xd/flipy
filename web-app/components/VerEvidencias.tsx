'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth';

interface EvidenciasData {
  envioId: string;
  estado: string;
  fotoEntrega?: string;
  firmaDigital?: string;
  metodoPago?: string;
  fechaEntrega?: string;
  evidencias?: any;
  tienda: {
    nombre: string;
    direccion: string;
  };
  origen: any;
  destino: any;
}

interface VerEvidenciasProps {
  envioId: string;
}

export default function VerEvidencias({ envioId }: VerEvidenciasProps) {
  const [evidencias, setEvidencias] = useState<EvidenciasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    loadEvidencias();
  }, [envioId]);

  const loadEvidencias = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = getToken();
      if (!token) {
        throw new Error('No estás autenticado');
      }

      const response = await fetch(`${API_URL}/api/evidencias/${envioId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar evidencias');
      }

      setEvidencias(data.data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar evidencias');
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha?: string) => {
    if (!fecha) return 'No registrada';
    const date = new Date(fecha);
    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMetodoPagoLabel = (metodo?: string) => {
    if (!metodo) return 'No registrado';
    
    const labels: { [key: string]: string } = {
      'efectivo': '💵 Efectivo',
      'tarjeta': '💳 Tarjeta',
      'yape': '📱 Yape',
      'plin': '💜 Plin',
      'transferencia': '🏦 Transferencia',
    };
    
    return labels[metodo] || metodo;
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleDescargar = () => {
    if (evidencias?.fotoEntrega) {
      const link = document.createElement('a');
      link.href = `${API_URL}${evidencias.fotoEntrega}`;
      link.download = `evidencia-${envioId}.jpg`;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando evidencias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h3 className="text-xl font-bold text-red-600 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!evidencias) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <p className="text-gray-600">No se encontraron evidencias</p>
        </div>
      </div>
    );
  }

  const tieneEvidencias = evidencias.fotoEntrega || evidencias.firmaDigital || evidencias.metodoPago;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header del Comprobante */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Comprobante de Entrega
        </h2>
        <p className="text-purple-100 text-sm">Envío ID: {envioId.slice(0, 12)}...</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Información de Fecha */}
        <div className="border-b pb-4">
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-semibold">Fecha de Entrega:</span>
          </div>
          <p className="text-lg text-gray-900 ml-7">{formatFecha(evidencias.fechaEntrega)}</p>
        </div>

        {/* Estado */}
        <div className="border-b pb-4">
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-semibold">Estado:</span>
          </div>
          <span className="ml-7 inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {evidencias.estado}
          </span>
        </div>

        {!tieneEvidencias && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 font-medium">
              ⚠️ No se registraron evidencias adicionales para esta entrega
            </p>
          </div>
        )}

        {/* Método de Pago */}
        {evidencias.metodoPago && (
          <div className="border-b pb-4">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-semibold">Método de Pago:</span>
            </div>
            <p className="text-lg text-gray-900 ml-7 font-medium">
              {getMetodoPagoLabel(evidencias.metodoPago)}
            </p>
          </div>
        )}

        {/* Foto de Entrega */}
        {evidencias.fotoEntrega && (
          <div className="border-b pb-4">
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold">Foto de Entrega:</span>
            </div>
            <div className="ml-7">
              <img
                src={`${API_URL}${evidencias.fotoEntrega}`}
                alt="Foto de entrega"
                className="w-full max-w-2xl rounded-lg border-2 border-gray-300 shadow-md"
              />
              <button
                onClick={handleDescargar}
                className="mt-2 text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar foto
              </button>
            </div>
          </div>
        )}

        {/* Firma Digital */}
        {evidencias.firmaDigital && (
          <div className="border-b pb-4">
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="font-semibold">Firma Digital:</span>
            </div>
            <div className="ml-7">
              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 inline-block">
                <img
                  src={evidencias.firmaDigital}
                  alt="Firma digital"
                  className="max-w-md h-auto"
                />
              </div>
            </div>
          </div>
        )}

        {/* Información de Ubicaciones */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-gray-800 mb-3">Detalles del Envío</h3>
          
          <div>
            <p className="text-sm text-gray-600 font-medium mb-1">Origen:</p>
            <p className="text-gray-900">
              {typeof evidencias.origen === 'object' ? evidencias.origen.direccion : evidencias.origen}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 font-medium mb-1">Destino:</p>
            <p className="text-gray-900">
              {typeof evidencias.destino === 'object' ? evidencias.destino.direccion : evidencias.destino}
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-3 pt-4 print:hidden">
          <button
            onClick={handleImprimir}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir Comprobante
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t">
          <p>Este es un comprobante digital de entrega generado por FLIPY</p>
          <p className="mt-1">Fecha de generación: {new Date().toLocaleString('es-PE')}</p>
        </div>
      </div>
    </div>
  );
}



