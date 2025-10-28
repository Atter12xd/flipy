/**
 * Utilidades para hacer requests al backend API
 */

import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

/**
 * Función helper para hacer requests al backend
 */
async function request(endpoint: string, options: RequestOptions = {}) {
  const { method = 'GET', body, headers = {}, requiresAuth = false } = options;

  const url = `${API_URL}${endpoint}`;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  // Agregar token de autenticación si es necesario
  if (requiresAuth) {
    const token = getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  // Agregar body si existe
  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición');
  }

  return data;
}

// ============================================
// AUTENTICACIÓN
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterTiendaData {
  email: string;
  password: string;
  phone: string;
  nombre: string;
  direccion: string;
}

export const authAPI = {
  /**
   * Login de tienda
   */
  login: (credentials: LoginCredentials) =>
    request('/api/auth/login', {
      method: 'POST',
      body: credentials,
    }),

  /**
   * Registro de tienda
   */
  registerTienda: (data: RegisterTiendaData) =>
    request('/api/auth/register/tienda', {
      method: 'POST',
      body: data,
    }),
};

// ============================================
// ENVÍOS
// ============================================

export interface CoordenadasEnvio {
  lat: number;
  lng: number;
  direccion: string;
  nombre?: string;
}

export interface CreateEnvioData {
  origen: CoordenadasEnvio;
  destino: CoordenadasEnvio;
  precio: number;
  detalles?: string;
}

export const enviosAPI = {
  /**
   * Obtener todos los envíos
   */
  getAll: () =>
    request('/api/envios', {
      requiresAuth: true,
    }),

  /**
   * Obtener un envío por ID
   */
  getById: (id: string) =>
    request(`/api/envios/${id}`, {
      requiresAuth: true,
    }),

  /**
   * Crear nuevo envío
   */
  create: (data: CreateEnvioData) =>
    request('/api/envios', {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }),

  /**
   * Cancelar/Eliminar envío
   */
  delete: (id: string) =>
    request(`/api/envios/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),

  /**
   * Obtener envíos asignados al motorizado (solo MOTORIZADO)
   */
  getAsignados: () =>
    request('/api/envios/motorizado/asignados', {
      requiresAuth: true,
    }),
};

// ============================================
// OFERTAS
// ============================================

export interface CreateOfertaData {
  envioId: string;
  precioOferta: number;
  tiempoEstimado: number;
}

export const ofertasAPI = {
  /**
   * Crear una nueva oferta (solo motorizados)
   */
  create: (data: CreateOfertaData) =>
    request('/api/ofertas', {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }),

  /**
   * Obtener ofertas de un envío
   */
  getByEnvio: (envioId: string) =>
    request(`/api/ofertas/envio/${envioId}`, {
      requiresAuth: true,
    }),

  /**
   * Aceptar una oferta
   */
  accept: (ofertaId: string) =>
    request(`/api/ofertas/${ofertaId}/aceptar`, {
      method: 'PUT',
      requiresAuth: true,
    }),
};

// ============================================
// TRACKING GPS
// ============================================

export interface UpdateUbicacionData {
  lat: number;
  lng: number;
}

export const trackingAPI = {
  /**
   * Actualizar ubicación del motorizado (solo MOTORIZADO)
   */
  updateUbicacion: (envioId: string, data: UpdateUbicacionData) =>
    request(`/api/tracking/${envioId}/ubicacion`, {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }),

  /**
   * Obtener ubicación actual del envío
   */
  getUbicacion: (envioId: string) =>
    request(`/api/tracking/${envioId}/ubicacion`, {
      requiresAuth: true,
    }),

  /**
   * Cambiar estado del envío (solo MOTORIZADO)
   */
  cambiarEstado: (envioId: string, nuevoEstado: string) =>
    request(`/api/tracking/${envioId}/estado`, {
      method: 'PUT',
      body: { nuevoEstado },
      requiresAuth: true,
    }),
};

// ============================================
// RASTREO PÚBLICO (sin autenticación)
// ============================================

export const publicAPI = {
  /**
   * Obtener envío por token público (NO requiere autenticación)
   */
  getEnvioByToken: (token: string) =>
    request(`/api/public/rastreo/${token}`, {
      requiresAuth: false,
    }),
};

// ============================================
// EVIDENCIAS DE ENTREGA
// ============================================

export const evidenciasAPI = {
  /**
   * Subir foto de entrega (multipart/form-data)
   * Nota: Esta función maneja FormData directamente, no usa la función request()
   */
  subirFotoEntrega: async (envioId: string, file: File) => {
    const token = getToken();
    
    // DEBUG: Verificar token
    console.log('[API] getToken() retornó:', token ? `${token.substring(0, 20)}...` : 'NULL/UNDEFINED');
    
    if (!token) {
      console.error('[API] ❌ Token es null/undefined - usuario no autenticado');
      throw new Error('No estás autenticado');
    }

    const formData = new FormData();
    formData.append('foto', file);

    console.log('[API] Enviando request a:', `${API_URL}/api/evidencias/${envioId}/foto`);
    console.log('[API] Token en header:', `Bearer ${token.substring(0, 20)}...`);

    const response = await fetch(`${API_URL}/api/evidencias/${envioId}/foto`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[API] ❌ Error del servidor:', response.status, data);
      throw new Error(data.message || 'Error al subir foto');
    }

    console.log('[API] ✅ Foto subida exitosamente');
    return data;
  },

  /**
   * Guardar firma digital (base64)
   */
  guardarFirma: (envioId: string, firmaBase64: string) =>
    request(`/api/evidencias/${envioId}/firma`, {
      method: 'POST',
      body: { firmaBase64 },
      requiresAuth: true,
    }),

  /**
   * Registrar método de pago usado
   */
  registrarMetodoPago: (envioId: string, metodoPago: string) =>
    request(`/api/evidencias/${envioId}/metodo-pago`, {
      method: 'POST',
      body: { metodoPago },
      requiresAuth: true,
    }),

  /**
   * Obtener evidencias de un envío
   */
  getEvidencias: (envioId: string) =>
    request(`/api/evidencias/${envioId}`, {
      requiresAuth: true,
    }),
};

