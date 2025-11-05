// Servicio de API base
import { CONFIG } from '../config.js';

export class ApiService {
    /**
     * Obtiene el token de autenticación
     */
    static getToken() {
        return localStorage.getItem(CONFIG.TOKEN_KEY);
    }

    /**
     * Guarda el token y datos de usuario
     */
    static setSession(token, userData) {
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(userData));
    }

    /**
     * Limpia la sesión
     */
    static clearSession() {
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);
    }

    /**
     * Obtiene headers con autenticación
     */
    static getAuthHeaders() {
        const token = this.getToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    /**
     * Realiza petición HTTP
     */
    static async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const headers = this.getAuthHeaders();
        
        const config = {
            ...options,
            headers: {
                ...headers,
                ...(options.headers || {})
            }
        };

        // Debug: mostrar la URL completa
        console.log(`[API] ${options.method || 'GET'} ${url}`);

        try {
            const response = await fetch(url, config);
            
            // Debug: mostrar respuesta
            console.log(`[API] Response: ${response.status} ${response.statusText}`);
            
            // Si es 401 y es un endpoint de login, no limpiar sesión (aún no hay sesión)
            // Solo limpiar sesión si no es el endpoint de login (sesión expirada)
            if (response.status === 401) {
                if (endpoint !== '/auth/login') {
                    // Sesión expirada en otras peticiones
                    this.clearSession();
                    window.location.hash = CONFIG.ROUTES.LOGIN;
                    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
                }
                // Para login, el error ya viene en el mensaje del servidor
            }

            // Intentar parsear como JSON
            const contentType = response.headers.get('content-type');
            let data = {};
            
            if (contentType && contentType.includes('application/json')) {
                try {
                    data = await response.json();
                } catch (e) {
                    console.warn('Error parseando JSON:', e);
                    data = {};
                }
            }
            
            if (!response.ok) {
                // Manejar error 405 específicamente
                if (response.status === 405) {
                    console.error('[API] Error 405 - Método no permitido:', {
                        method: options.method || 'GET',
                        url: url,
                        endpoint: endpoint,
                        headers: config.headers
                    });
                    throw new Error(`Método HTTP no permitido para ${endpoint}. Verifica que el backend esté ejecutándose y accesible en ${CONFIG.API_BASE_URL}`);
                }
                const errorMsg = data.detail || data.message || `Error ${response.status}`;
                throw new Error(errorMsg);
            }

            return data;
        } catch (error) {
            console.error('Error en API request:', { endpoint, url, error, config });
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en ' + CONFIG.API_BASE_URL);
            }
            throw error;
        }
    }

    /**
     * GET request
     */
    static async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * POST request
     */
    static async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    /**
     * PUT request
     */
    static async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    /**
     * DELETE request
     */
    static async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    /**
     * PATCH request
     */
    static async patch(endpoint, body = null) {
        const options = { method: 'PATCH' };
        if (body) {
            options.body = JSON.stringify(body);
        }
        return this.request(endpoint, options);
    }
}

