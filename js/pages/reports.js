// Página de reportes con exportación a PDF
import { ApiService } from '../services/api.js';
import { DOMUtils } from '../utils/dom.js';
import { SecurityUtils } from '../utils/security.js';
import { DataTableUtils } from '../utils/datatable.js';
import { SwalUtils } from '../utils/swal.js';

export class ReportsPage {
    static currentReport = null;

    static async render() {
        const content = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="mb-0"><i class="bi bi-file-earmark-bar-graph text-primary"></i> Reportes</h2>
            </div>
            <div class="row g-3 mb-4">
                <div class="col-md-4">
                    <div class="card shadow-sm h-100 border-top border-danger border-3">
                        <div class="card-body text-center">
                            <div class="mb-3" style="font-size: 3rem; color: #ee6c4d;">
                                <i class="bi bi-exclamation-triangle-fill"></i>
                            </div>
                            <h5 class="card-title">Usuarios Morosos</h5>
                            <p class="card-text text-muted">Más de 35 días sin pagar</p>
                            <button class="btn btn-primary w-100" onclick="ReportsPage.loadReport('morosos')">
                                <i class="bi bi-file-earmark-pdf"></i> Generar Reporte
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card shadow-sm h-100 border-top border-success border-3">
                        <div class="card-body text-center">
                            <div class="mb-3" style="font-size: 3rem; color: #28a745;">
                                <i class="bi bi-graph-up-arrow"></i>
                            </div>
                            <h5 class="card-title">Ingresos por Mes</h5>
                            <p class="card-text text-muted">Resumen mensual de ingresos</p>
                            <button class="btn btn-primary w-100" onclick="ReportsPage.loadReport('ingresos')">
                                <i class="bi bi-file-earmark-pdf"></i> Generar Reporte
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card shadow-sm h-100 border-top border-info border-3">
                        <div class="card-body text-center">
                            <div class="mb-3" style="font-size: 3rem; color: #17a2b8;">
                                <i class="bi bi-list-check"></i>
                            </div>
                            <h5 class="card-title">Pagos por Usuario</h5>
                            <p class="card-text text-muted">Detalle de pagos por usuario</p>
                            <button class="btn btn-primary w-100" onclick="ReportsPage.loadReport('pagos-usuario')">
                                <i class="bi bi-file-earmark-pdf"></i> Generar Reporte
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div id="report-results"></div>
        `;

        const container = document.getElementById('page-content');
        if (container) {
            container.innerHTML = content;
            window.ReportsPage = ReportsPage;
        }
    }

    static async loadReport(type) {
        const resultsDiv = document.getElementById('report-results');
        if (!resultsDiv) return;

        try {
            DOMUtils.toggleLoading(true);
            const report = await ApiService.get(`/reports/${type}`);
            this.currentReport = report;

            const headers = report.encabezados || [];
            const data = report.datos || [];
            const fechaGen = report.fecha_generacion ? new Date(report.fecha_generacion).toLocaleString('es-ES') : 'N/A';

            let tableRows = '';
            if (data.length > 0) {
                tableRows = data.map(row => {
                    const cells = headers.map((_, idx) => {
                        const value = row[idx] !== undefined && row[idx] !== null ? row[idx] : 'N/A';
                        const formattedValue = typeof value === 'number' && !isNaN(value) 
                            ? (value.toString().includes('.') ? value.toFixed(2) : value.toString())
                            : value;
                        return `<td>${SecurityUtils.sanitize(String(formattedValue))}</td>`;
                    }).join('');
                    return `<tr>${cells}</tr>`;
                }).join('');
            }

            const headerRow = headers.map(h => `<th>${SecurityUtils.sanitize(h)}</th>`).join('');

            resultsDiv.innerHTML = `
                <div class="card shadow-sm">
                    <div class="card-header bg-primary text-white">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="mb-0"><i class="bi bi-file-earmark-text"></i> ${SecurityUtils.sanitize(report.tipo_reporte || 'Reporte')}</h5>
                                <small class="text-white-50">Generado: ${SecurityUtils.sanitize(fechaGen)}</small>
                            </div>
                            <div>
                                <span class="badge bg-light text-dark me-2">${data.length} registros</span>
                                <button class="btn btn-sm btn-light" onclick="ReportsPage.exportToPDF()">
                                    <i class="bi bi-file-pdf"></i> Exportar PDF
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card-body p-3">
                        <div class="table-responsive">
                            <table id="reportTable" class="table table-hover table-striped w-100">
                                <thead class="table-light">
                                    <tr>${headerRow}</tr>
                                </thead>
                                <tbody>
                                    ${tableRows}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            
            // Inicializar DataTable
            requestAnimationFrame(() => {
                setTimeout(() => {
                    if ($.fn.DataTable) {
                        // Destruir tabla si existe
                        DataTableUtils.destroy('reportTable');
                        // Esperar un frame más para asegurar que el DOM esté limpio
                        requestAnimationFrame(() => {
                            DataTableUtils.init('reportTable', {
                                dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip',
                                pageLength: 25
                            });
                        });
                    }
                }, 100);
            });
        } catch (error) {
            console.error('Error cargando reporte:', error);
            SwalUtils.error(error.message || 'Error al generar el reporte');
            resultsDiv.innerHTML = '';
        } finally {
            DOMUtils.toggleLoading(false);
        }
    }

    static exportToPDF() {
        if (!this.currentReport) {
            SwalUtils.warning('No hay reporte para exportar');
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('landscape');
            
            // Configuración y colores
            const pageWidth = 297; // landscape width
            const pageHeight = 210; // landscape height
            const margin = 15;
            const primaryColor = [0, 81, 135]; // #005187
            const secondaryColor = [77, 130, 188]; // #4d82bc
            const lightColor = [196, 218, 250]; // #c4dafa
            
            const headers = this.currentReport.encabezados || [];
            const data = this.currentReport.datos || [];
            const fechaGen = this.currentReport.fecha_generacion 
                ? new Date(this.currentReport.fecha_generacion).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
                : new Date().toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            
            // ===== HEADER CON FONDO COLORIDO =====
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, pageWidth, 30, 'F');
            
            // Título principal
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('COMITÉ DE AGUA - ALDEA PANCHO DE LEÓN', pageWidth / 2, 12, { align: 'center' });
            
            doc.setFontSize(14);
            doc.text(this.currentReport.tipo_reporte || 'Reporte', pageWidth / 2, 22, { align: 'center' });
            
            // ===== INFORMACIÓN DEL REPORTE =====
            let yPos = 38;
            doc.setFillColor(...lightColor);
            doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 12, 2, 2, 'F');
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Fecha de generación: ${fechaGen}`, margin + 5, yPos + 8);
            
            // Contar total de registros si hay datos
            if (data.length > 0) {
                doc.text(`Total de registros: ${data.length}`, pageWidth - margin - 50, yPos + 8);
            }
            
            yPos += 18;
            
            // Preparar datos para la tabla
            const tableData = data.map(row => 
                headers.map((_, idx) => {
                    const value = row[idx] !== undefined && row[idx] !== null ? row[idx] : 'N/A';
                    if (typeof value === 'number' && !isNaN(value)) {
                        // Si es un número, formatearlo
                        if (value.toString().includes('.')) {
                            return value.toFixed(2);
                        }
                        return value.toString();
                    }
                    // Si parece ser un número en string (como montos), intentar formatearlo
                    if (typeof value === 'string' && /^\d+\.?\d*$/.test(value.trim())) {
                        const numValue = parseFloat(value);
                        return numValue.toFixed(2);
                    }
                    return String(value);
                })
            );
            
            // Crear tabla con mejor diseño
            doc.autoTable({
                head: [headers],
                body: tableData,
                startY: yPos,
                styles: { 
                    fontSize: 8,
                    cellPadding: 3,
                    textColor: [0, 0, 0]
                },
                headStyles: { 
                    fillColor: primaryColor,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                alternateRowStyles: { 
                    fillColor: [248, 249, 250]
                },
                margin: { 
                    top: yPos,
                    left: margin,
                    right: margin
                },
                theme: 'grid',
                columnStyles: {},
                didParseCell: function (data) {
                    // Si la celda contiene un número (monto), alinearla a la derecha
                    if (data.column.index > 0 && data.cell.text && !isNaN(data.cell.text[0])) {
                        data.cell.styles.halign = 'right';
                    }
                }
            });
            
            // Obtener la posición final de la tabla
            const finalY = doc.lastAutoTable.finalY || yPos + (tableData.length * 5);
            
            // ===== FOOTER =====
            const footerY = pageHeight - 15;
            doc.setDrawColor(...primaryColor);
            doc.setLineWidth(0.5);
            doc.line(margin, footerY, pageWidth - margin, footerY);
            
            doc.setFontSize(7);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 100, 100);
            doc.text('Sistema de Gestión de Agua SPL - Comité de Agua Aldea Pancho de León', pageWidth / 2, footerY + 5, { align: 'center' });
            doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`, pageWidth / 2, footerY + 10, { align: 'center' });
            
            // Guardar PDF
            const filename = `${(this.currentReport.tipo_reporte || 'Reporte').replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
            SwalUtils.success('Reporte exportado correctamente');
        } catch (error) {
            console.error('Error exportando PDF:', error);
            SwalUtils.error('Error al exportar el reporte a PDF');
        }
    }
}
