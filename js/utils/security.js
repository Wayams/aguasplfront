// Utilidades de seguridad
export class SecurityUtils {
    /**
     * Sanitiza entrada de texto (previene XSS básico)
     */
    static sanitize(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Valida formato de email básico
     */
    static isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /**
     * Valida que una cadena no esté vacía ni solo espacios
     */
    static isNotEmpty(str) {
        return typeof str === 'string' && str.trim().length > 0;
    }

    /**
     * Previene inyección SQL básica (sanitiza comillas)
     */
    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.replace(/'/g, "''").trim();
    }
}

