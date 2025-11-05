// Página de login
import { AuthService } from '../services/auth.js';
import { DOMUtils } from '../utils/dom.js';
import { CONFIG } from '../config.js';
import { SwalUtils } from '../utils/swal.js';

export class LoginPage {
    static render() {
        const content = `
            <div class="login-container">
                <div class="login-card card shadow-lg">
                    <div class="card-body p-5">
                        <div class="text-center mb-4">
                            <div class="mb-3" style="font-size: 4rem; color: var(--primary);">
                                <i class="bi bi-droplet-fill"></i>
                            </div>
                            <h2 class="card-title mb-2">Sistema de Gestión de Agua</h2>
                            <p class="text-muted">Inicia sesión para continuar</p>
                        </div>
                        <form id="login-form">
                            <div class="mb-3">
                                <label for="usuario" class="form-label"><i class="bi bi-person"></i> Usuario</label>
                                <input type="text" class="form-control form-control-lg" id="usuario" name="usuario" required autocomplete="username" placeholder="Ingresa tu usuario">
                            </div>
                            <div class="mb-4">
                                <label for="clave" class="form-label"><i class="bi bi-lock"></i> Contraseña</label>
                                <input type="password" class="form-control form-control-lg" id="clave" name="clave" required autocomplete="current-password" placeholder="Ingresa tu contraseña">
                            </div>
                            <button type="submit" class="btn btn-primary btn-lg w-100">
                                <i class="bi bi-box-arrow-in-right"></i> Ingresar
                            </button>
                        </form>
                        <div id="login-error" class="alert alert-danger mt-3 d-none">
                            <i class="bi bi-exclamation-triangle-fill"></i> <span id="error-message"></span>
                        </div>
                    </div>
                </div>
            </div>
        `;

            const container = document.getElementById('page-content-login');
            if (container) {
                container.innerHTML = content;
                this.attachEvents();
            }
    }

    static attachEvents() {
        const form = document.getElementById('login-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const errorDiv = document.getElementById('login-error');
                errorDiv.classList.add('d-none');

                const usuario = document.getElementById('usuario').value;
                const clave = document.getElementById('clave').value;

                try {
                    SwalUtils.loading('Iniciando sesión...');
                    errorDiv.classList.add('d-none');
                    await AuthService.login(usuario, clave);
                    SwalUtils.close();
                    SwalUtils.success('¡Bienvenido!');
                    setTimeout(() => {
                        window.location.hash = CONFIG.ROUTES.DASHBOARD;
                    }, 500);
                } catch (error) {
                    console.error('Error en login:', error);
                    SwalUtils.close();
                    document.getElementById('error-message').textContent = error.message || 'Error al iniciar sesión';
                    errorDiv.classList.remove('d-none');
                }
            });
        }
    }
}

