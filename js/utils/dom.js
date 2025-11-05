// Utilidades DOM
import { SecurityUtils } from './security.js';

export class DOMUtils {
    /**
     * Muestra/oculta elemento de carga
     */
    static toggleLoading(show = true) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.toggle('d-none', !show);
        }
    }

    /**
     * Muestra mensaje de error
     */
    static showError(message, containerId = null) {
        // Detectar contenedor según si estamos en login o no
        if (!containerId) {
            const isLogin = window.location.hash === '#login' || !window.location.hash;
            containerId = isLogin ? 'page-content-login' : 'page-content';
        }
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Si hay SweetAlert disponible, usarlo
        if (typeof Swal !== 'undefined') {
            import('./swal.js').then(({ SwalUtils }) => {
                SwalUtils.error(message);
            });
            return;
        }
        
        container.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Error:</strong> ${SecurityUtils.sanitize(message)}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    /**
     * Muestra mensaje de éxito
     */
    static showSuccess(message, containerId = null) {
        // Si hay SweetAlert disponible, usarlo
        if (typeof Swal !== 'undefined') {
            import('./swal.js').then(({ SwalUtils }) => {
                SwalUtils.success(message);
            });
            return;
        }
        
        // Detectar contenedor según si estamos en login o no
        if (!containerId) {
            const isLogin = window.location.hash === '#login' || !window.location.hash;
            containerId = isLogin ? 'page-content-login' : 'page-content';
        }
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show';
        alert.innerHTML = `
            <i class="bi bi-check-circle-fill"></i> ${SecurityUtils.sanitize(message)}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        container.insertBefore(alert, container.firstChild);
        
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            if (alert.parentNode) {
                alert.classList.remove('show');
                setTimeout(() => alert.remove(), 150);
            }
        }, 5000);
    }

    /**
     * Limpia contenido del contenedor
     */
    static clearContent(containerId = null) {
        // Detectar contenedor según si estamos en login o no
        if (!containerId) {
            const isLogin = window.location.hash === '#login' || !window.location.hash;
            containerId = isLogin ? 'page-content-login' : 'page-content';
        }
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = '';
    }
}
