'use client';

import { useState, useRef, useEffect } from 'react';
import { getToken } from '@/lib/auth';

interface EvidenciasFormProps {
  envioId: string;
  onSuccess?: () => void;
}

export default function EvidenciasForm({ envioId, onSuccess }: EvidenciasFormProps) {
  // Estados para foto
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [fotoUploaded, setFotoUploaded] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  // Estados para firma
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [firmaGuardada, setFirmaGuardada] = useState(false);
  const [uploadingFirma, setUploadingFirma] = useState(false);

  // Estados para método de pago
  const [metodoPago, setMetodoPago] = useState('');
  const [pagoRegistrado, setPagoRegistrado] = useState(false);
  const [uploadingPago, setUploadingPago] = useState(false);

  // Estados generales
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // ============================================
  // FOTO DE ENTREGA
  // ============================================

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const handleUploadFoto = async () => {
    if (!selectedFile) {
      setError('Por favor selecciona una foto');
      return;
    }

    setUploadingFoto(true);
    setError('');

    try {
      const token = getToken();
      if (!token) {
        throw new Error('No estás autenticado');
      }

      // BUG FIX 1: Debug logging para verificar token
      console.log('[DEBUG] Token enviado:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

      const formData = new FormData();
      formData.append('foto', selectedFile);

      console.log('[DEBUG] Enviando foto:', selectedFile.name, `(${(selectedFile.size / 1024).toFixed(2)} KB)`);

      const response = await fetch(`${API_URL}/api/evidencias/${envioId}/foto`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // NO agregar 'Content-Type', el navegador lo hace automático con FormData
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[DEBUG] Error del servidor:', data);
        throw new Error(data.message || 'Error al subir la foto');
      }

      console.log('[DEBUG] Foto subida exitosamente:', data);
      setFotoUploaded(true);
      setSuccess('Foto subida exitosamente');
      setTimeout(() => setSuccess(''), 3000);

    } catch (err: any) {
      console.error('[DEBUG] Error en handleUploadFoto:', err);
      setError(err.message || 'Error al subir la foto');
    } finally {
      setUploadingFoto(false);
    }
  };

  // ============================================
  // FIRMA DIGITAL
  // ============================================

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // BUG FIX 2: Calcular coordenadas correctas del canvas considerando scale y scroll
  const getCanvasCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    setHasSignature(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setFirmaGuardada(false);
  };

  const handleGuardarFirma = async () => {
    if (!hasSignature) {
      setError('Por favor dibuja tu firma');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    setUploadingFirma(true);
    setError('');

    try {
      const token = getToken();
      if (!token) {
        throw new Error('No estás autenticado');
      }

      // Convertir canvas a base64
      const firmaBase64 = canvas.toDataURL('image/png');

      const response = await fetch(`${API_URL}/api/evidencias/${envioId}/firma`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firmaBase64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar la firma');
      }

      setFirmaGuardada(true);
      setSuccess('Firma guardada exitosamente');
      setTimeout(() => setSuccess(''), 3000);

    } catch (err: any) {
      setError(err.message || 'Error al guardar la firma');
    } finally {
      setUploadingFirma(false);
    }
  };

  // ============================================
  // MÉTODO DE PAGO
  // ============================================

  const handleConfirmarPago = async () => {
    if (!metodoPago) {
      setError('Por favor selecciona un método de pago');
      return;
    }

    setUploadingPago(true);
    setError('');

    try {
      const token = getToken();
      if (!token) {
        throw new Error('No estás autenticado');
      }

      const response = await fetch(`${API_URL}/api/evidencias/${envioId}/metodo-pago`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metodoPago }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar método de pago');
      }

      setPagoRegistrado(true);
      setSuccess('Método de pago registrado. ¡Entrega completada!');
      
      // Llamar callback de éxito
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }

    } catch (err: any) {
      setError(err.message || 'Error al registrar método de pago');
    } finally {
      setUploadingPago(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Evidencias de Entrega
      </h2>

      {/* Mensajes globales */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* SECCIÓN A: FOTO DE ENTREGA */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
            1
          </span>
          Foto de Entrega
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Foto
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
              disabled={fotoUploaded}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
            />
          </div>

          {previewUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</p>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-gray-300"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleUploadFoto}
            disabled={!selectedFile || uploadingFoto || fotoUploaded}
            className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {uploadingFoto ? 'Subiendo...' : fotoUploaded ? '✓ Foto Subida' : 'Subir Foto'}
          </button>
        </div>
      </div>

      {/* SECCIÓN B: FIRMA DIGITAL */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
            2
          </span>
          Firma Digital
        </h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Dibuja tu firma en el recuadro (usa mouse o touch)
            </p>
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full border-2 border-gray-300 rounded-lg cursor-crosshair touch-none bg-white"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearSignature}
              disabled={firmaGuardada}
              className="flex-1 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleGuardarFirma}
              disabled={!hasSignature || uploadingFirma || firmaGuardada}
              className="flex-1 bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {uploadingFirma ? 'Guardando...' : firmaGuardada ? '✓ Firma Guardada' : 'Guardar Firma'}
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN C: MÉTODO DE PAGO */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
            3
          </span>
          Método de Pago
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            {[
              { value: 'efectivo', label: '💵 Efectivo' },
              { value: 'tarjeta', label: '💳 Tarjeta' },
              { value: 'yape', label: '📱 Yape' },
              { value: 'plin', label: '💜 Plin' },
              { value: 'transferencia', label: '🏦 Transferencia' },
            ].map((metodo) => (
              <label
                key={metodo.value}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                  metodoPago === metodo.value
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-300'
                } ${pagoRegistrado ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="metodoPago"
                  value={metodo.value}
                  checked={metodoPago === metodo.value}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  disabled={pagoRegistrado}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-3 text-gray-700 font-medium">{metodo.label}</span>
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={handleConfirmarPago}
            disabled={!metodoPago || uploadingPago || pagoRegistrado}
            className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-lg"
          >
            {uploadingPago ? 'Confirmando...' : pagoRegistrado ? '✓ Pago Registrado - Entrega Completada' : 'Confirmar Método de Pago'}
          </button>

          {!fotoUploaded && !firmaGuardada && (
            <p className="text-sm text-amber-600 text-center">
              ⚠️ Se recomienda subir al menos una foto o firma antes de confirmar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}



