/**
 * Utilidades de autenticación
 * Manejo de token JWT en localStorage
 */

const TOKEN_KEY = 'flipy_auth_token';
const USER_KEY = 'flipy_user';

export interface User {
  id: string;
  email: string;
  role: string;
  phone?: string;
  tienda?: {
    id: string;
    nombre: string;
    direccion: string;
    billetera: number;
    comision: number;
  };
}

/**
 * Guardar token en localStorage
 */
export const saveToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Obtener token de localStorage
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

/**
 * Eliminar token de localStorage
 */
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * Guardar datos del usuario en localStorage
 */
export const saveUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

/**
 * Obtener datos del usuario de localStorage
 */
export const getUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
};

/**
 * Verificar si el usuario está autenticado
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Cerrar sesión
 */
export const logout = (): void => {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

