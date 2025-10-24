/**
 * Utilidades para hacer requests al backend API
 */

import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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
    } else {
      console.warn('⚠️ Request requiere autenticación pero no hay token');
    }
  }

  // Agregar body si existe
  if (body) {
    config.body = JSON.stringify(body);
  }

  console.log(`📡 ${method} ${url}`);
  if (body) {
    console.log('📤 Body:', body);
  }

  const response = await fetch(url, config);
  
  console.log(`📥 Respuesta ${response.status} de ${url}`);
  
  const data = await response.json();

  if (!response.ok) {
    console.error(`❌ Error ${response.status}:`, data);
    throw new Error(data.message || 'Error en la petición');
  }

  console.log(`✅ Success:`, data);
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
    request('/auth/login', {
      method: 'POST',
      body: credentials,
    }),

  /**
   * Registro de tienda
   */
  registerTienda: (data: RegisterTiendaData) =>
    request('/auth/register/tienda', {
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
    request('/envios', {
      requiresAuth: true,
    }),

  /**
   * Obtener un envío por ID
   */
  getById: (id: string) =>
    request(`/envios/${id}`, {
      requiresAuth: true,
    }),

  /**
   * Crear nuevo envío
   */
  create: (data: CreateEnvioData) =>
    request('/envios', {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }),

  /**
   * Cancelar/Eliminar envío
   */
  delete: (id: string) =>
    request(`/envios/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),

  /**
   * Obtener envíos asignados al motorizado (solo MOTORIZADO)
   */
  getAsignados: () =>
    request('/envios/motorizado/asignados', {
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
    request('/ofertas', {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }),

  /**
   * Obtener ofertas de un envío
   */
  getByEnvio: (envioId: string) =>
    request(`/ofertas/envio/${envioId}`, {
      requiresAuth: true,
    }),

  /**
   * Aceptar una oferta
   */
  accept: (ofertaId: string) =>
    request(`/ofertas/${ofertaId}/aceptar`, {
      method: 'PUT',
      requiresAuth: true,
    }),
};

