// Configuración base de la aplicación
export const CONFIG = {
    API_BASE_URL: window.API_BASE_URL || 'http://127.0.0.1:8000',
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

