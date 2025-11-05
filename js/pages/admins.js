// Página de administradores (solo Presidente)
import { ApiService } from '../services/api.js';
import { DOMUtils } from '../utils/dom.js';
import { SecurityUtils } from '../utils/security.js';
import { AuthService } from '../services/auth.js';
import { DataTableUtils } from '../utils/datatable.js';
import { SwalUtils } from '../utils/swal.js';

export class AdminsPage {
    static admins = [];

    static async render() {
        try {
            // Verificar que el usuario sea Presidente
            const currentUser = AuthService.getCurrentUser();
            if (currentUser?.Rol !== 'Presidente') {
                DOMUtils.showError('Solo el Presidente puede acceder a esta sección');
                return;
            }

            DOMUtils.toggleLoading(true);
            this.admins = await ApiService.get('/admins/');

            let tableRows = '';
            if (this.admins && this.admins.length > 0) {
                tableRows = this.admins.map(admin => {
                    const estado = admin.estado !== false ? 'Activo' : 'Inactivo';
                    const estadoClass = admin.estado !== false ? 'active' : 'inactive';
                    const isCurrentUser = admin.id_admin === currentUser?.id_admin;
                    const canDelete = !isCurrentUser;
                    
                    return `
                        <tr>
                            <td><strong>${SecurityUtils.sanitize(admin.id_admin || 'N/A')}</strong></td>
                            <td>${SecurityUtils.sanitize(admin.usuario || 'N/A')}</td>
                            <td>${SecurityUtils.sanitize(admin.nombre || 'N/A')}</td>
                            <td>
                                <span class="badge bg-info">${SecurityUtils.sanitize(admin.rol || 'N/A')}</span>
                            </td>
                            <td>
                                <span class="badge badge-status ${estadoClass}">
                                    <i class="bi bi-${admin.estado !== false ? 'check-circle' : 'x-circle'}"></i> ${estado}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="AdminsPage.editAdmin(${admin.id_admin})" title="Editar">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-warning" onclick="AdminsPage.changePassword(${admin.id_admin})" title="Cambiar Contraseña">
                                    <i class="bi bi-key"></i>
                                </button>
                                ${canDelete ? `
                                    <button class="btn btn-sm btn-danger" onclick="AdminsPage.deleteAdmin(${admin.id_admin})" title="Eliminar">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                ` : '<span class="text-muted small">(Tú)</span>'}
                            </td>
                        </tr>
                    `;
                }).join('');
            }

            const content = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 class="mb-0"><i class="bi bi-shield-check text-primary"></i> Administradores</h2>
                        <p class="text-muted mb-0 small">Solo visible para el Presidente</p>
                    </div>
                    <button class="btn btn-primary" onclick="AdminsPage.showCreateModal()">
                        <i class="bi bi-plus-circle"></i> Crear Administrador
                    </button>
                </div>
                <div class="card shadow-sm">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0"><i class="bi bi-list-ul"></i> Lista de Administradores</h5>
                    </div>
                    <div class="card-body p-3">
                        <div class="table-responsive">
                            <table id="adminsTable" class="table table-hover table-striped w-100">
                                <thead class="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Usuario</th>
                                        <th>Nombre</th>
                                        <th>Rol</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tableRows}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Modal Crear/Editar Administrador -->
                <div class="modal fade" id="adminModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header bg-primary text-white">
                                <h5 class="modal-title" id="adminModalTitle">Crear Administrador</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <form id="adminForm">
                                <div class="modal-body">
                                    <input type="hidden" id="adminId" name="adminId">
                                    <div class="mb-3">
                                        <label for="usuario" class="form-label">Usuario *</label>
                                        <input type="text" class="form-control" id="usuario" name="usuario" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="nombre" class="form-label">Nombre Completo *</label>
                                        <input type="text" class="form-control" id="nombre" name="nombre" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="rol" class="form-label">Rol *</label>
                                        <select class="form-select" id="rol" name="rol" required>
                                            <option value="">Seleccione un rol</option>
                                            <option value="Presidente">Presidente</option>
                                            <option value="Tesorero">Tesorero</option>
                                            <option value="Secretario">Secretario</option>
                                            <option value="Vocal">Vocal</option>
                                        </select>
                                    </div>
                                    <div class="mb-3" id="passwordField">
                                        <label for="clave" class="form-label">Contraseña *</label>
                                        <input type="password" class="form-control" id="clave" name="clave" required>
                                        <small class="text-muted">Mínimo 6 caracteres</small>
                                    </div>
                                    <div class="mb-3" id="estadoField" style="display: none;">
                                        <label class="form-label">Estado</label>
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="estado" name="estado" checked>
                                            <label class="form-check-label" for="estado">Activo</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                    <button type="submit" class="btn btn-primary">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Modal Cambiar Contraseña -->
                <div class="modal fade" id="passwordModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header bg-warning text-dark">
                                <h5 class="modal-title">Cambiar Contraseña</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <form id="passwordForm">
                                <div class="modal-body">
                                    <input type="hidden" id="passwordAdminId" name="passwordAdminId">
                                    <div class="mb-3">
                                        <label for="nueva_clave" class="form-label">Nueva Contraseña *</label>
                                        <input type="password" class="form-control" id="nueva_clave" name="nueva_clave" required minlength="6">
                                        <small class="text-muted">Mínimo 6 caracteres</small>
                                    </div>
                                    <div class="mb-3">
                                        <label for="confirmar_clave" class="form-label">Confirmar Contraseña *</label>
                                        <input type="password" class="form-control" id="confirmar_clave" name="confirmar_clave" required minlength="6">
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                    <button type="submit" class="btn btn-warning">Cambiar Contraseña</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;

            const container = document.getElementById('page-content');
            if (container) {
                container.innerHTML = content;
                this.attachEvents();
                
                // Inicializar DataTable
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        if ($.fn.DataTable) {
                            // Destruir tabla si existe
                            DataTableUtils.destroy('adminsTable');
                            // Esperar un frame más para asegurar que el DOM esté limpio
                            requestAnimationFrame(() => {
                                DataTableUtils.init('adminsTable', {
                                    columnDefs: [
                                        { orderable: false, targets: 5 } // Deshabilitar ordenamiento en columna de acciones
                                    ]
                                });
                            });
                        }
                    }, 100);
                });
                
                window.AdminsPage = this;
            }
        } catch (error) {
            console.error('Error cargando administradores:', error);
            if (error.message.includes('403') || error.message.includes('Solo el Presidente')) {
                DOMUtils.showError('Solo el Presidente puede acceder a esta sección');
            } else {
                DOMUtils.showError(error.message || 'Error al cargar administradores');
            }
        } finally {
            DOMUtils.toggleLoading(false);
        }
    }

    static attachEvents() {
        const adminForm = document.getElementById('adminForm');
        if (adminForm) {
            adminForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const adminId = document.getElementById('adminId').value;
                const formData = {
                    usuario: document.getElementById('usuario').value,
                    nombre: document.getElementById('nombre').value,
                    rol: document.getElementById('rol').value
                };

                try {
                    SwalUtils.loading('Guardando administrador...');
                    if (adminId) {
                        // Editar
                        const clave = document.getElementById('clave').value;
                        // Si se proporciona una contraseña nueva, incluirla
                        if (clave && clave.trim().length > 0) {
                            if (clave.length < 6) {
                                SwalUtils.warning('La contraseña debe tener al menos 6 caracteres');
                                return;
                            }
                            formData.clave = clave;
                        }
                        await ApiService.put(`/admins/${adminId}`, formData);
                        SwalUtils.close();
                        SwalUtils.success('Administrador actualizado correctamente');
                    } else {
                        // Crear
                        formData.clave = document.getElementById('clave').value;
                        formData.estado = document.getElementById('estado').checked;
                        await ApiService.post('/admins/', formData);
                        SwalUtils.close();
                        SwalUtils.success('Administrador creado correctamente');
                    }
                    const modal = bootstrap.Modal.getInstance(document.getElementById('adminModal'));
                    modal.hide();
                    await this.render();
                } catch (error) {
                    console.error('Error guardando administrador:', error);
                    SwalUtils.close();
                    SwalUtils.error(error.message || 'Error al guardar administrador');
                }
            });
        }

        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nuevaClave = document.getElementById('nueva_clave').value;
                const confirmarClave = document.getElementById('confirmar_clave').value;
                const adminId = document.getElementById('passwordAdminId').value;

                if (nuevaClave !== confirmarClave) {
                    SwalUtils.warning('Las contraseñas no coinciden');
                    return;
                }

                if (nuevaClave.length < 6) {
                    SwalUtils.warning('La contraseña debe tener al menos 6 caracteres');
                    return;
                }

                try {
                    SwalUtils.loading('Cambiando contraseña...');
                    await ApiService.patch(`/admins/${adminId}/change-password`, {
                        nueva_clave: nuevaClave
                    });
                    SwalUtils.close();
                    SwalUtils.success('Contraseña actualizada correctamente');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('passwordModal'));
                    modal.hide();
                    passwordForm.reset();
                } catch (error) {
                    console.error('Error cambiando contraseña:', error);
                    SwalUtils.close();
                    SwalUtils.error(error.message || 'Error al cambiar contraseña');
                }
            });
        }
    }

    static showCreateModal() {
        document.getElementById('adminModalTitle').textContent = 'Crear Administrador';
        document.getElementById('adminId').value = '';
        document.getElementById('adminForm').reset();
        document.getElementById('passwordField').style.display = 'block';
        document.getElementById('passwordField').querySelector('label').innerHTML = 'Contraseña *';
        document.getElementById('passwordField').querySelector('small').textContent = 'Mínimo 6 caracteres';
        document.getElementById('estadoField').style.display = 'block';
        document.getElementById('estado').checked = true;
        document.getElementById('clave').required = true;
        const modal = new bootstrap.Modal(document.getElementById('adminModal'));
        modal.show();
    }

    static async editAdmin(adminId) {
        try {
            const admin = await ApiService.get(`/admins/${adminId}`);
            document.getElementById('adminModalTitle').textContent = 'Editar Administrador';
            document.getElementById('adminId').value = admin.id_admin;
            document.getElementById('usuario').value = admin.usuario || '';
            document.getElementById('nombre').value = admin.nombre || '';
            document.getElementById('rol').value = admin.rol || '';
            // Mostrar campo de contraseña como opcional al editar
            document.getElementById('passwordField').style.display = 'block';
            document.getElementById('passwordField').querySelector('label').innerHTML = 'Nueva Contraseña (opcional)';
            document.getElementById('passwordField').querySelector('small').textContent = 'Dejar en blanco para mantener la contraseña actual. Mínimo 6 caracteres si se cambia.';
            document.getElementById('clave').value = '';
            document.getElementById('clave').required = false;
            document.getElementById('estadoField').style.display = 'none';
            const modal = new bootstrap.Modal(document.getElementById('adminModal'));
            modal.show();
        } catch (error) {
            console.error('Error cargando administrador:', error);
            SwalUtils.error(error.message || 'Error al cargar administrador');
        }
    }

    static changePassword(adminId) {
        document.getElementById('passwordAdminId').value = adminId;
        document.getElementById('passwordForm').reset();
        const modal = new bootstrap.Modal(document.getElementById('passwordModal'));
        modal.show();
    }

    static async deleteAdmin(adminId) {
        const admin = this.admins.find(a => a.id_admin === adminId);
        if (!admin) return;

        const confirmed = await SwalUtils.confirm(
            '¿Eliminar administrador?',
            `¿Está seguro de eliminar al administrador "${admin.usuario}"? Esta acción no se puede deshacer.`,
            'warning'
        );

        if (!confirmed) return;

        try {
            SwalUtils.loading('Eliminando administrador...');
            await ApiService.delete(`/admins/${adminId}`);
            SwalUtils.close();
            SwalUtils.success('Administrador eliminado correctamente');
            await this.render();
        } catch (error) {
            console.error('Error eliminando administrador:', error);
            SwalUtils.close();
            SwalUtils.error(error.message || 'Error al eliminar administrador');
        }
    }
}

