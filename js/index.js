// Punto de entrada principal
import { Router } from './router.js';
import { AuthService } from './services/auth.js';
import { CONFIG } from './config.js';

// Configurar API base URL si está definida globalmente
if (window.API_BASE_URL) {
    CONFIG.API_BASE_URL = window.API_BASE_URL;
}

// Mostrar configuración de API en consola para debug
console.log('🔧 Configuración de API:', {
    API_BASE_URL: CONFIG.API_BASE_URL,
    window_API_BASE_URL: window.API_BASE_URL
});

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Si no hay hash y está autenticado, ir a dashboard
    if (!window.location.hash && AuthService.isAuthenticated()) {
        window.location.hash = CONFIG.ROUTES.DASHBOARD;
    } else if (!window.location.hash) {
        window.location.hash = CONFIG.ROUTES.LOGIN;
    }
    
    Router.init();
});

