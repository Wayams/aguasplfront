// Router simple basado en hash
import { AuthService } from './services/auth.js';
import { CONFIG } from './config.js';
import { LoginPage } from './pages/login.js';
import { DashboardPage } from './pages/dashboard.js';
import { UsersPage } from './pages/users.js';
import { PaymentsPage } from './pages/payments.js';
import { ReportsPage } from './pages/reports.js';
import { AdminsPage } from './pages/admins.js';
import { DOMUtils } from './utils/dom.js';
import { Sidebar } from './components/Sidebar.js';

export class Router {
    static routes = {
        [CONFIG.ROUTES.LOGIN]: LoginPage,
        [CONFIG.ROUTES.DASHBOARD]: DashboardPage,
        [CONFIG.ROUTES.USERS]: UsersPage,
        [CONFIG.ROUTES.PAYMENTS]: PaymentsPage,
        [CONFIG.ROUTES.REPORTS]: ReportsPage,
        [CONFIG.ROUTES.ADMINS]: AdminsPage
    };

    static init() {
        // Manejar cambios de hash
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Manejar carga inicial
        this.handleRoute();
        
        // Actualizar navegación
        this.updateNavigation();
    }

    static handleRoute() {
        const hash = window.location.hash || CONFIG.ROUTES.LOGIN;
        const Page = this.routes[hash];

        if (!Page) {
            DOMUtils.showError('Página no encontrada');
            return;
        }

        // Proteger rutas excepto login
        if (hash !== CONFIG.ROUTES.LOGIN && !AuthService.isAuthenticated()) {
            window.location.hash = CONFIG.ROUTES.LOGIN;
            return;
        }

        // Si está autenticado y va a login, redirigir a dashboard
        if (hash === CONFIG.ROUTES.LOGIN && AuthService.isAuthenticated()) {
            window.location.hash = CONFIG.ROUTES.DASHBOARD;
            return;
        }

        // Mostrar/ocultar layout según autenticación
        const isAuth = AuthService.isAuthenticated();
        const appLayout = document.getElementById('app-layout');
        const loginContent = document.getElementById('login-content');
        const mainNavbar = document.getElementById('main-navbar');
        
        if (hash === CONFIG.ROUTES.LOGIN) {
            // Mostrar layout de login
            if (appLayout) appLayout.classList.add('d-none');
            if (mainNavbar) mainNavbar.classList.remove('d-none');
            if (loginContent) loginContent.classList.remove('d-none');
            DOMUtils.clearContent('page-content-login');
            if (Page.render) {
                Page.render();
            }
        } else if (isAuth) {
            // Mostrar layout con sidebar
            if (appLayout) appLayout.classList.remove('d-none');
            if (mainNavbar) mainNavbar.classList.add('d-none');
            if (loginContent) loginContent.classList.add('d-none');
            Sidebar.render();
            DOMUtils.clearContent('page-content');
            if (Page.render) {
                Page.render();
            }
            // Actualizar activo después de un pequeño delay para asegurar que el DOM esté listo
            setTimeout(() => Sidebar.updateActive(), 50);
        }
        
        this.updateNavigation();
    }

    static updateNavigation() {
        const navMenu = document.getElementById('nav-menu');
        if (!navMenu) return;

        const isAuth = AuthService.isAuthenticated();

        if (!isAuth) {
            navMenu.innerHTML = `
                <li class="nav-item"><a class="nav-link" href="#login">Iniciar Sesión</a></li>
            `;
        }
    }

    static logout() {
        AuthService.logout();
        this.updateNavigation();
    }
}

// Exportar logout para uso global
window.Router = Router;

