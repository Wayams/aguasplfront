// Servicio de autenticación
import { ApiService } from './api.js';
import { SecurityUtils } from '../utils/security.js';
import { CONFIG } from '../config.js';

export class AuthService {
    /**
     * Inicia sesión
     */
    static async login(usuario, clave) {
        if (!SecurityUtils.isNotEmpty(usuario) || !SecurityUtils.isNotEmpty(clave)) {
            throw new Error('Usuario y contraseña son requeridos');
        }

        const sanitizedUsuario = SecurityUtils.sanitizeInput(usuario);
        
        const data = await ApiService.post('/auth/login', {
            usuario: sanitizedUsuario,
            clave: clave
        });

        if (data.access_token) {
            ApiService.setSession(data.access_token, data.user_data);
            return data;
        }

        throw new Error('Error al iniciar sesión');
    }

    /**
     * Cierra sesión
     */
    static logout() {
        ApiService.clearSession();
        window.location.hash = CONFIG.ROUTES.LOGIN;
    }

    /**
     * Verifica si hay sesión activa
     */
    static isAuthenticated() {
        return !!ApiService.getToken();
    }

    /**
     * Obtiene datos del usuario actual
     */
    static getCurrentUser() {
        const userStr = localStorage.getItem(CONFIG.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }
}

