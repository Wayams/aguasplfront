// Página de usuarios con crear, editar y desactivar
import { ApiService } from '../services/api.js';
import { DOMUtils } from '../utils/dom.js';
import { SecurityUtils } from '../utils/security.js';
import { DataTableUtils } from '../utils/datatable.js';
import { SwalUtils } from '../utils/swal.js';

export class UsersPage {
    static users = [];

    static async render() {
        try {
            DOMUtils.toggleLoading(true);
            this.users = await ApiService.get('/users/');

            let tableRows = '';
            if (this.users && this.users.length > 0) {
                tableRows = this.users.map(user => {
                    const estado = user.estado !== false ? 'Activo' : 'Inactivo';
                    const estadoClass = user.estado !== false ? 'active' : 'inactive';
                    return `
                        <tr>
                            <td><strong>${SecurityUtils.sanitize(user.id_usuario || 'N/A')}</strong></td>
                            <td>${SecurityUtils.sanitize(user.nombre || '')} ${SecurityUtils.sanitize(user.apellido || '')}</td>
                            <td>${SecurityUtils.sanitize(user.numero_paja || 'N/A')}</td>
                            <td>${SecurityUtils.sanitize(user.direccion || 'N/A')}</td>
                            <td>${SecurityUtils.sanitize(user.telefono || 'N/A')}</td>
                            <td>
                                <span class="badge badge-status ${estadoClass}">
                                    <i class="bi bi-${user.estado !== false ? 'check-circle' : 'x-circle'}"></i> ${estado}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="UsersPage.editUser(${user.id_usuario})" title="Editar">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-${user.estado !== false ? 'warning' : 'success'}" onclick="UsersPage.toggleStatus(${user.id_usuario})" title="${user.estado !== false ? 'Desactivar' : 'Activar'}">
                                    <i class="bi bi-${user.estado !== false ? 'toggle-on' : 'toggle-off'}"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }

            const content = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="mb-0"><i class="bi bi-people-fill text-primary"></i> Usuarios</h2>
                    <button class="btn btn-primary" onclick="UsersPage.showCreateModal()">
                        <i class="bi bi-plus-circle"></i> Crear Usuario
                    </button>
                </div>
                <div class="card shadow-sm">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0"><i class="bi bi-list-ul"></i> Lista de Usuarios</h5>
                    </div>
                    <div class="card-body p-3">
                        <div class="table-responsive">
                            <table id="usersTable" class="table table-hover table-striped w-100">
                                <thead class="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre Completo</th>
                                        <th>N° Paja</th>
                                        <th>Dirección</th>
                                        <th>Teléfono</th>
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

                <!-- Modal Crear/Editar Usuario -->
                <div class="modal fade" id="userModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header bg-primary text-white">
                                <h5 class="modal-title" id="userModalTitle">Crear Usuario</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <form id="userForm">
                                <div class="modal-body">
                                    <input type="hidden" id="userId" name="userId">
                                    <div class="mb-3">
                                        <label for="nombre" class="form-label">Nombre *</label>
                                        <input type="text" class="form-control" id="nombre" name="nombre" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="apellido" class="form-label">Apellido *</label>
                                        <input type="text" class="form-control" id="apellido" name="apellido" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="numero_paja" class="form-label">Número de Paja *</label>
                                        <input type="text" class="form-control" id="numero_paja" name="numero_paja" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="direccion" class="form-label">Dirección *</label>
                                        <input type="text" class="form-control" id="direccion" name="direccion" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="telefono" class="form-label">Teléfono</label>
                                        <input type="text" class="form-control" id="telefono" name="telefono">
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
            `;

            const container = document.getElementById('page-content');
            if (container) {
                container.innerHTML = content;
                this.attachEvents();
                
                // Inicializar DataTable después de renderizar
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        if ($.fn.DataTable) {
                            // Destruir tabla si existe
                            DataTableUtils.destroy('usersTable');
                            // Esperar un frame más para asegurar que el DOM esté limpio
                            requestAnimationFrame(() => {
                                DataTableUtils.init('usersTable', {
                                    columnDefs: [
                                        { orderable: false, targets: 6 } // Deshabilitar ordenamiento en columna de acciones
                                    ]
                                });
                            });
                        }
                    }, 100);
                });
                
                window.UsersPage = this;
            }
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            DOMUtils.showError(error.message || 'Error al cargar usuarios');
        } finally {
            DOMUtils.toggleLoading(false);
        }
    }

    static attachEvents() {
        const form = document.getElementById('userForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const userId = document.getElementById('userId').value;
                const formData = {
                    nombre: document.getElementById('nombre').value,
                    apellido: document.getElementById('apellido').value,
                    numero_paja: document.getElementById('numero_paja').value,
                    direccion: document.getElementById('direccion').value,
                    telefono: document.getElementById('telefono').value || null
                };

                try {
                    SwalUtils.loading('Guardando usuario...');
                    if (userId) {
                        // Editar
                        await ApiService.put(`/users/${userId}`, formData);
                        SwalUtils.close();
                        SwalUtils.success('Usuario actualizado correctamente');
                    } else {
                        // Crear
                        formData.estado = document.getElementById('estado').checked;
                        await ApiService.post('/users/', formData);
                        SwalUtils.close();
                        SwalUtils.success('Usuario creado correctamente');
                    }
                    const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
                    modal.hide();
                    await this.render();
                } catch (error) {
                    console.error('Error guardando usuario:', error);
                    SwalUtils.close();
                    SwalUtils.error(error.message || 'Error al guardar usuario');
                }
            });
        }
    }

    static showCreateModal() {
        document.getElementById('userModalTitle').textContent = 'Crear Usuario';
        document.getElementById('userId').value = '';
        document.getElementById('userForm').reset();
        document.getElementById('estadoField').style.display = 'block';
        document.getElementById('estado').checked = true;
        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        modal.show();
    }

    static async editUser(userId) {
        try {
            const user = await ApiService.get(`/users/${userId}`);
            document.getElementById('userModalTitle').textContent = 'Editar Usuario';
            document.getElementById('userId').value = user.id_usuario;
            document.getElementById('nombre').value = user.nombre || '';
            document.getElementById('apellido').value = user.apellido || '';
            document.getElementById('numero_paja').value = user.numero_paja || '';
            document.getElementById('direccion').value = user.direccion || '';
            document.getElementById('telefono').value = user.telefono || '';
            document.getElementById('estadoField').style.display = 'none';
            const modal = new bootstrap.Modal(document.getElementById('userModal'));
            modal.show();
        } catch (error) {
            console.error('Error cargando usuario:', error);
            SwalUtils.error(error.message || 'Error al cargar usuario');
        }
    }

    static async toggleStatus(userId) {
        const user = this.users.find(u => u.id_usuario === userId);
        const newStatus = user?.estado !== false ? 'desactivar' : 'activar';
        
        const confirmed = await SwalUtils.confirm(
            '¿Cambiar estado del usuario?',
            `¿Está seguro de ${newStatus} este usuario?`,
            'question'
        );
        
        if (!confirmed) return;

        try {
            SwalUtils.loading('Cambiando estado...');
            await ApiService.patch(`/users/${userId}/toggle-status`);
            SwalUtils.close();
            SwalUtils.success('Estado del usuario actualizado correctamente');
            await this.render();
        } catch (error) {
            console.error('Error cambiando estado:', error);
            SwalUtils.close();
            SwalUtils.error(error.message || 'Error al cambiar estado del usuario');
        }
    }
}
