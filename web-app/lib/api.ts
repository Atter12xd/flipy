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

  const response = await fetch(`${API_URL}${endpoint}`, config);
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
};

// ============================================
// OFERTAS
// ============================================

export const ofertasAPI = {
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

