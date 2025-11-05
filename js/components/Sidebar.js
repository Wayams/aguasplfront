// Componente Sidebar
import { AuthService } from '../services/auth.js';
import { CONFIG } from '../config.js';

export class Sidebar {
    static render() {
        const user = AuthService.getCurrentUser();
        const currentHash = window.location.hash || CONFIG.ROUTES.DASHBOARD;
        
        const menuItems = [
            { route: CONFIG.ROUTES.DASHBOARD, icon: 'bi-speedometer2', label: 'Dashboard' },
            { route: CONFIG.ROUTES.USERS, icon: 'bi-people', label: 'Usuarios' },
            { route: CONFIG.ROUTES.PAYMENTS, icon: 'bi-cash-stack', label: 'Pagos' },
            { route: CONFIG.ROUTES.REPORTS, icon: 'bi-file-earmark-bar-graph', label: 'Reportes' }
        ];

        // Agregar Administradores solo si es Presidente
        if (user?.Rol === 'Presidente') {
            menuItems.push({ route: CONFIG.ROUTES.ADMINS, icon: 'bi-shield-check', label: 'Administradores' });
        }

        const navItems = menuItems.map(item => {
            const isActive = currentHash === item.route ? 'active' : '';
            return `
                <a href="${item.route}" class="sidebar-item ${isActive}">
                    <i class="bi ${item.icon}"></i>
                    <span>${item.label}</span>
                </a>
            `;
        }).join('');

        const sidebarNav = document.getElementById('sidebar-nav');
        if (sidebarNav) {
            sidebarNav.innerHTML = navItems;
        }

        const userName = document.getElementById('user-name');
        if (userName) {
            userName.textContent = user?.Usuario || 'Usuario';
        }

        // Agregar event listeners a los items del sidebar
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const href = item.getAttribute('href');
                if (href) {
                    window.location.hash = href;
                    // Cerrar sidebar en móvil después de hacer clic
                    if (window.innerWidth <= 768) {
                        setTimeout(() => this.toggleMobile(), 100);
                    }
                }
            });
        });
    }

    static updateActive() {
        const currentHash = window.location.hash || CONFIG.ROUTES.DASHBOARD;
        document.querySelectorAll('.sidebar-item').forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentHash) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    static toggleMobile() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar) {
            const isShowing = sidebar.classList.contains('show');
            sidebar.classList.toggle('show');
            // El overlay se maneja con CSS
            if (overlay && !isShowing) {
                overlay.style.display = 'block';
            } else if (overlay && isShowing) {
                overlay.style.display = 'none';
            }
        }
    }
}

// Exportar para uso global
window.Sidebar = Sidebar;

