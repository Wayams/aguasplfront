// Configuración base de la aplicación
export const CONFIG = {
    API_BASE_URL: window.API_BASE_URL || 'https://backend.aguaspl.site',
    TOKEN_KEY: 'auth_token',
    USER_KEY: 'auth_user',
    ROUTES: {
        LOGIN: '#login',
        DASHBOARD: '#dashboard',
        USERS: '#users',
        PAYMENTS: '#payments',
        REPORTS: '#reports',
        ADMINS: '#admins'
    }
};

