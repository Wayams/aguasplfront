// Página de pagos con crear y generar recibos PDF
import { ApiService } from '../services/api.js';
import { DOMUtils } from '../utils/dom.js';
import { SecurityUtils } from '../utils/security.js';
import { DataTableUtils } from '../utils/datatable.js';
import { SwalUtils } from '../utils/swal.js';

export class PaymentsPage {
    static payments = [];
    static users = [];

    static async render() {
        try {
            DOMUtils.toggleLoading(true);
            const [paymentsData, usersData] = await Promise.all([
                ApiService.get('/payments/').catch(() => []),
                ApiService.get('/users/').catch(() => [])
            ]);

            this.payments = paymentsData;
            this.users = usersData;

            let tableRows = '';
            let totalMonto = 0;
            
            if (this.payments && this.payments.length > 0) {
                tableRows = this.payments.map(payment => {
                    const fecha = payment.fecha_pago ? new Date(payment.fecha_pago).toLocaleDateString('es-ES') : 'N/A';
                    const monto = payment.monto ? parseFloat(payment.monto) : 0;
                    totalMonto += monto;
                    const montoFormatted = monto > 0 ? `Q${monto.toFixed(2)}` : 'N/A';
                    const nombreCompleto = `${payment.nombre || ''} ${payment.apellido || ''}`.trim() || 'N/A';
                    
                    return `
                        <tr>
                            <td><strong>${SecurityUtils.sanitize(payment.id_pago || 'N/A')}</strong></td>
                            <td>${SecurityUtils.sanitize(nombreCompleto)}</td>
                            <td>${SecurityUtils.sanitize(payment.numero_paja || 'N/A')}</td>
                            <td><i class="bi bi-calendar"></i> ${SecurityUtils.sanitize(fecha)}</td>
                            <td><strong class="text-success">${SecurityUtils.sanitize(montoFormatted)}</strong></td>
                            <td>${SecurityUtils.sanitize(payment.mes_pagado || 'N/A')}</td>
                            <td><span class="badge bg-secondary">${SecurityUtils.sanitize(payment.metodo_pago || 'N/A')}</span></td>
                            <td>
                                <button class="btn btn-sm btn-danger" onclick="PaymentsPage.generateReceipt(${payment.id_pago})" title="Generar Recibo PDF">
                                    <i class="bi bi-file-pdf"></i> PDF
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }

            const content = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="mb-0"><i class="bi bi-cash-stack text-primary"></i> Pagos</h2>
                    <div>
                        <button class="btn btn-primary" onclick="PaymentsPage.showCreateModal()">
                            <i class="bi bi-plus-circle"></i> Crear Pago
                        </button>
                    </div>
                </div>
                <div class="d-flex justify-content-end mb-3">
                    <span class="badge bg-success me-2">Total: ${this.payments?.length || 0}</span>
                    <span class="badge bg-primary">Suma: Q${totalMonto.toFixed(2)}</span>
                </div>
                <div class="card shadow-sm">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0"><i class="bi bi-list-ul"></i> Historial de Pagos</h5>
                    </div>
                    <div class="card-body p-3">
                        <div class="table-responsive">
                            <table id="paymentsTable" class="table table-hover table-striped w-100">
                                <thead class="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Usuario</th>
                                        <th>N° Paja</th>
                                        <th>Fecha</th>
                                        <th>Monto</th>
                                        <th>Mes</th>
                                        <th>Método</th>
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

                <!-- Modal Crear Pago -->
                <div class="modal fade" id="paymentModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header bg-primary text-white">
                                <h5 class="modal-title">Crear Pago</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <form id="paymentForm">
                                <div class="modal-body">
                                    <div class="mb-3">
                                        <label for="id_usuario" class="form-label">Usuario *</label>
                                        <select class="form-select select2" id="id_usuario" name="id_usuario" required>
                                            <option value="">Seleccione un usuario</option>
                                            ${this.users.map(u => `
                                                <option value="${u.id_usuario}">${u.nombre} ${u.apellido} - N° Paja: ${u.numero_paja}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label for="monto" class="form-label">Monto (Q) *</label>
                                        <input type="number" step="0.01" min="0.01" class="form-control" id="monto" name="monto" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="fecha_pago" class="form-label">Fecha de Pago *</label>
                                        <input type="date" class="form-control" id="fecha_pago" name="fecha_pago" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="mes_pagado" class="form-label">Mes Pagado *</label>
                                        <select class="form-select" id="mes_pagado" name="mes_pagado" required>
                                            <option value="">Seleccione mes y año</option>
                                            ${(() => {
                                                const meses = [
                                                    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                                                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                                                ];
                                                const añoActual = new Date().getFullYear();
                                                let options = '';
                                                // Generar opciones para el año actual y los 2 años anteriores
                                                for (let año = añoActual; año >= añoActual - 2; año--) {
                                                    meses.forEach((mes, index) => {
                                                        options += `<option value="${mes} ${año}">${mes} ${año}</option>`;
                                                    });
                                                }
                                                return options;
                                            })()}
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label for="metodo_pago" class="form-label">Método de Pago *</label>
                                        <select class="form-select" id="metodo_pago" name="metodo_pago" required>
                                            <option value="">Seleccione método</option>
                                            <option value="Efectivo">Efectivo</option>
                                            <option value="Transferencia">Transferencia</option>
                                            <option value="Cheque">Cheque</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label for="observacion" class="form-label">Observación</label>
                                        <textarea class="form-control" id="observacion" name="observacion" rows="2"></textarea>
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
                // Establecer fecha actual por defecto
                const fechaInput = document.getElementById('fecha_pago');
                if (fechaInput) {
                    fechaInput.value = new Date().toISOString().split('T')[0];
                }
                
                // Inicializar Select2 para el campo de usuario
                this.initSelect2();
                
                // Inicializar DataTable
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        if ($.fn.DataTable) {
                            // Destruir tabla si existe
                            DataTableUtils.destroy('paymentsTable');
                            // Esperar un frame más para asegurar que el DOM esté limpio
                            requestAnimationFrame(() => {
                                DataTableUtils.init('paymentsTable', {
                                    columnDefs: [
                                        { orderable: false, targets: 7 }, // Acciones
                                        { type: 'date', targets: 3 } // Fecha
                                    ]
                                });
                            });
                        }
                    }, 100);
                });
                
                window.PaymentsPage = this;
            }
        } catch (error) {
            console.error('Error cargando pagos:', error);
            DOMUtils.showError(error.message || 'Error al cargar pagos');
        } finally {
            DOMUtils.toggleLoading(false);
        }
    }

    static attachEvents() {
        const form = document.getElementById('paymentForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = {
                    id_usuario: parseInt(document.getElementById('id_usuario').value),
                    monto: parseFloat(document.getElementById('monto').value),
                    fecha_pago: document.getElementById('fecha_pago').value,
                    mes_pagado: document.getElementById('mes_pagado').value,
                    metodo_pago: document.getElementById('metodo_pago').value,
                    observacion: document.getElementById('observacion').value || null
                };

                try {
                    SwalUtils.loading('Creando pago...');
                    await ApiService.post('/payments/', formData);
                    SwalUtils.close();
                    SwalUtils.success('Pago creado correctamente');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
                    modal.hide();
                    // Destruir Select2 antes de recargar
                    if ($.fn.select2) {
                        $('#id_usuario').select2('destroy');
                    }
                    await this.render();
                } catch (error) {
                    console.error('Error creando pago:', error);
                    SwalUtils.close();
                    SwalUtils.error(error.message || 'Error al crear pago');
                }
            });
        }
    }

    static initSelect2() {
        // Inicializar Select2 en el campo de usuario
        if ($.fn.select2) {
            const selectUsuario = $('#id_usuario');
            if (selectUsuario.length) {
                // Destruir Select2 si ya está inicializado
                if (selectUsuario.hasClass('select2-hidden-accessible')) {
                    selectUsuario.select2('destroy');
                }
                
                // Inicializar Select2
                selectUsuario.select2({
                    theme: 'bootstrap-5',
                    placeholder: 'Buscar usuario...',
                    allowClear: true,
                    width: '100%',
                    dropdownParent: $('#paymentModal'),
                    language: {
                        noResults: function() {
                            return "No se encontraron usuarios";
                        },
                        searching: function() {
                            return "Buscando...";
                        }
                    }
                });
            }
        }
    }

    static showCreateModal() {
        document.getElementById('paymentForm').reset();
        const fechaInput = document.getElementById('fecha_pago');
        if (fechaInput) {
            fechaInput.value = new Date().toISOString().split('T')[0];
        }
        
        const modalElement = document.getElementById('paymentModal');
        const modal = new bootstrap.Modal(modalElement);
        
        // Reinicializar Select2 después de que el modal esté visible
        const initSelect2Handler = () => {
            setTimeout(() => {
                this.initSelect2();
            }, 100);
            // Remover el listener después de usarlo una vez
            modalElement.removeEventListener('shown.bs.modal', initSelect2Handler);
        };
        
        modalElement.addEventListener('shown.bs.modal', initSelect2Handler);
        modal.show();
    }

    static async generateReceipt(paymentId) {
        try {
            DOMUtils.toggleLoading(true);
            const payment = await ApiService.get(`/payments/${paymentId}`);
            
            // Usar jsPDF para generar el recibo
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configuración
            const margin = 20;
            const pageWidth = 210;
            const textColor = [50, 50, 50]; // Gris oscuro
            const lightGray = [200, 200, 200]; // Gris claro para líneas
            let yPos = margin;
            
            // Función para dibujar línea punteada
            const drawDashedLine = (x1, y1, x2, y2, dashLength = 3) => {
                doc.setDrawColor(...lightGray);
                doc.setLineWidth(0.3);
                const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const dashCount = Math.floor(distance / dashLength);
                const dx = (x2 - x1) / dashCount;
                
                for (let i = 0; i < dashCount; i += 2) {
                    const startX = x1 + (dx * i);
                    const startY = y1;
                    const endX = Math.min(startX + dx, x2);
                    doc.line(startX, startY, endX, startY);
                }
            };
            
            // Función para dibujar línea de puntos
            const drawDottedLine = (x1, y1, x2, y2) => {
                doc.setDrawColor(...lightGray);
                doc.setLineWidth(0.2);
                const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const dotCount = Math.floor(distance / 2);
                const dx = (x2 - x1) / dotCount;
                
                for (let i = 0; i <= dotCount; i++) {
                    const x = x1 + (dx * i);
                    doc.circle(x, y1, 0.5, 'F');
                }
            };
            
            doc.setTextColor(...textColor);
            
            // ===== HEADER =====
            // Nombre del establecimiento
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('COMITÉ DE AGUA', pageWidth / 2, yPos, { align: 'center' });
            yPos += 5;
            
            // Línea punteada
            drawDashedLine(margin, yPos, pageWidth - margin, yPos);
            yPos += 8;
            
            // Título RECIBO
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('RECIBO', pageWidth / 2, yPos, { align: 'center' });
            yPos += 5;
            
            // Línea punteada
            drawDashedLine(margin, yPos, pageWidth - margin, yPos);
            yPos += 10;
            
            // ===== INFORMACIÓN DEL RECIBO =====
            const receiptNumber = `REC-${payment.id_pago.toString().padStart(5, '0')}`;
            const fechaEmision = new Date().toLocaleDateString('es-ES', { 
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const horaEmision = new Date().toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            
            // Columna izquierda
            doc.text(`Dirección: Aldea Pancho de León`, margin, yPos);
            yPos += 5;
            doc.text(`Fecha: ${fechaEmision}`, margin, yPos);
            yPos += 5;
            doc.text(`Recibo: ${receiptNumber}`, margin, yPos);
            
            // Columna derecha
            yPos -= 10;
            doc.text(horaEmision, pageWidth - margin, yPos, { align: 'right' });
            yPos += 5;
            doc.text(`Terminal #1`, pageWidth - margin, yPos, { align: 'right' });
            
            yPos += 8;
            
            // Línea punteada corta
            drawDashedLine(margin, yPos, pageWidth - margin, yPos, 2);
            yPos += 8;
            
            // ===== ENCABEZADOS DE TABLA =====
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('ITEM', margin, yPos);
            doc.text('CANT.', pageWidth / 2 - 10, yPos, { align: 'center' });
            doc.text('MONTO', pageWidth - margin, yPos, { align: 'right' });
            
            yPos += 5;
            // Línea punteada corta
            drawDashedLine(margin, yPos, pageWidth - margin, yPos, 2);
            yPos += 8;
            
            // ===== DETALLES DEL PAGO =====
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            
            // Suscriptor
            const nombreCompleto = `${payment.nombre} ${payment.apellido}`;
            doc.text(nombreCompleto, margin, yPos);
            doc.text('1', pageWidth / 2 - 10, yPos, { align: 'center' });
            doc.text(`Q ${parseFloat(payment.monto).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
            
            yPos += 5;
            
            // Mes pagado
            doc.text(`Mes: ${payment.mes_pagado}`, margin, yPos);
            yPos += 5;
            
            // Método de pago
            doc.text(`Método: ${payment.metodo_pago}`, margin, yPos);
            
            yPos += 8;
            
            // Línea punteada corta
            drawDashedLine(margin, yPos, pageWidth - margin, yPos, 2);
            yPos += 8;
            
            // ===== TOTAL =====
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            const montoTotal = parseFloat(payment.monto).toFixed(2);
            doc.text('TOTAL', margin, yPos);
            doc.text(`Q ${montoTotal}`, pageWidth - margin, yPos, { align: 'right' });
            
            yPos += 8;
            
            // ===== DETALLES DE PAGO =====
            if (payment.metodo_pago && payment.metodo_pago.toLowerCase() !== 'efectivo') {
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(`Método: ${payment.metodo_pago}`, margin, yPos);
                yPos += 5;
            }
            
            yPos += 5;
            
            // ===== OBSERVACIONES (si existe) =====
            if (payment.observacion) {
                yPos += 3;
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(`Nota: ${payment.observacion}`, margin, yPos);
                yPos += 8;
            }
            
            yPos += 5;
            
            // ===== FOOTER =====
            // Línea de puntos
            drawDottedLine(margin, yPos, pageWidth - margin, yPos);
            yPos += 10;
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('¡GRACIAS!', pageWidth / 2, yPos, { align: 'center' });
            
            // Guardar PDF
            doc.save(`${receiptNumber}.pdf`);
            SwalUtils.success('Recibo generado correctamente');
        } catch (error) {
            console.error('Error generando recibo:', error);
            SwalUtils.error(error.message || 'Error al generar recibo');
        } finally {
            DOMUtils.toggleLoading(false);
        }
    }
}
