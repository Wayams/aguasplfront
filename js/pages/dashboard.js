// Página de dashboard con estadísticas y gráficas
import { AuthService } from '../services/auth.js';
import { ApiService } from '../services/api.js';
import { DOMUtils } from '../utils/dom.js';

export class DashboardPage {
    static async render() {
        try {
            DOMUtils.toggleLoading(true);
            const user = AuthService.getCurrentUser();
            
            // Cargar datos en paralelo
            const [health, users, payments] = await Promise.all([
                ApiService.get('/health').catch(() => null),
                ApiService.get('/users/').catch(() => []),
                ApiService.get('/payments/').catch(() => [])
            ]);

            const totalUsers = users?.length || 0;
            const totalPayments = payments?.length || 0;
            const totalAmount = payments?.reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0) || 0;
            const activeUsers = users?.filter(u => u.estado !== false).length || 0;
            const inactiveUsers = totalUsers - activeUsers;

            // Calcular ingresos por mes
            const paymentsByMonth = {};
            payments?.forEach(p => {
                if (p.mes_pagado && p.monto) {
                    const month = p.mes_pagado;
                    paymentsByMonth[month] = (paymentsByMonth[month] || 0) + parseFloat(p.monto);
                }
            });

            const months = Object.keys(paymentsByMonth).sort();
            const amounts = months.map(m => paymentsByMonth[m]);

            // Calcular pagos por método
            const paymentsByMethod = {};
            payments?.forEach(p => {
                if (p.metodo_pago) {
                    paymentsByMethod[p.metodo_pago] = (paymentsByMethod[p.metodo_pago] || 0) + 1;
                }
            });

            const methods = Object.keys(paymentsByMethod);
            const methodCounts = methods.map(m => paymentsByMethod[m]);

            // Calcular tendencias (simuladas para el ejemplo)
            const userTrend = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0;
            const paymentTrend = totalPayments > 0 ? 2.6 : 0;
            const amountTrend = totalAmount > 0 ? 3.2 : 0;

            const content = `
                <!-- Header con saludo -->
                <div class="dashboard-header mb-4">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 class="mb-1">Hola|, Bienvenido</h2>
                            <p class="text-muted mb-0">${user?.Usuario || 'Usuario'}</p>
                        </div>
         
                    </div>
                </div>

                <!-- Tarjetas de Estadísticas -->
                <div class="row g-3 mb-4">
                    <div class="col-md-6 col-lg-3">
                        <div class="stat-card primary">
                            <div class="stat-header">
                                <div class="stat-icon primary">
                                    <i class="bi bi-people-fill"></i>
                                </div>
                                <canvas class="stat-mini-chart" id="chartUsersMini"></canvas>
                            </div>
                            <div class="stat-content">
                                <h3 class="stat-value">${totalUsers}</h3>
                                <p class="stat-label">Total Usuarios</p>
                                <div class="stat-trend positive">
                                    <i class="bi bi-arrow-up"></i>
                                    <span>${userTrend}% activos</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-3">
                        <div class="stat-card success">
                            <div class="stat-header">
                                <div class="stat-icon success">
                                    <i class="bi bi-cash-stack"></i>
                                </div>
                                <canvas class="stat-mini-chart" id="chartPaymentsMini"></canvas>
                            </div>
                            <div class="stat-content">
                                <h3 class="stat-value">${totalPayments}</h3>
                                <p class="stat-label">Total Pagos</p>
                                <div class="stat-trend positive">
                                    <i class="bi bi-arrow-up"></i>
                                    <span>+${paymentTrend}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-3">
                        <div class="stat-card warning">
                            <div class="stat-header">
                                <div class="stat-icon warning">
                                    <i class="bi bi-currency-exchange"></i>
                                </div>
                                <canvas class="stat-mini-chart" id="chartAmountMini"></canvas>
                            </div>
                            <div class="stat-content">
                                <h3 class="stat-value">Q${totalAmount.toFixed(0)}</h3>
                                <p class="stat-label">Ingresos Totales</p>
                                <div class="stat-trend positive">
                                    <i class="bi bi-arrow-up"></i>
                                    <span>+${amountTrend}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-3">
                        <div class="stat-card info">
                            <div class="stat-header">
                                <div class="stat-icon info">
                                    <i class="bi bi-server"></i>
                                </div>
                                <canvas class="stat-mini-chart" id="chartSystemMini"></canvas>
                            </div>
                            <div class="stat-content">
                                <h3 class="stat-value">
                                    <span class="badge bg-${health?.status === 'healthy' ? 'success' : 'danger'}">${health?.status || 'N/A'}</span>
                                </h3>
                                <p class="stat-label">Estado Sistema</p>
                                <div class="stat-trend">
                                    <span>BD: ${health?.database || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Gráficas -->
                <div class="row g-3 mb-4">
                    <div class="col-lg-12">
                        <div class="card shadow-sm">
                            <div class="card-header bg-primary text-white">
                                <h5 class="mb-0"><i class="bi bi-graph-up"></i> Ingresos por Mes</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="chartIngresos"></canvas>
                            </div>
                        </div>
                    </div>

                </div>

        
            `;

            const container = document.getElementById('page-content');
            if (container) {
                container.innerHTML = content;
                
                // Renderizar gráficas después de que el DOM esté listo
                setTimeout(() => {
                    this.renderCharts(months, amounts, methods, methodCounts, activeUsers, inactiveUsers);
                    this.renderMiniCharts();
                }, 100);
            }
        } catch (error) {
            console.error('Error cargando dashboard:', error);
            DOMUtils.showError(error.message || 'Error al cargar el panel');
        } finally {
            DOMUtils.toggleLoading(false);
        }
    }

    static renderCharts(months, amounts, methods, methodCounts, activeUsers, inactiveUsers) {
        // Gráfica de ingresos por mes
        const ctxIngresos = document.getElementById('chartIngresos');
        if (ctxIngresos && months.length > 0) {
            new Chart(ctxIngresos, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'Ingresos (Q)',
                        data: amounts,
                        borderColor: 'rgb(61, 90, 128)',
                        backgroundColor: 'rgba(61, 90, 128, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return 'Ingresos: Q' + context.parsed.y.toFixed(2);
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'Q' + value.toFixed(2);
                                }
                            }
                        }
                    }
                }
            });
        }

        // Gráfica de pagos por método
        const ctxMetodos = document.getElementById('chartMetodos');
        if (ctxMetodos && methods.length > 0) {
            new Chart(ctxMetodos, {
                type: 'doughnut',
                data: {
                    labels: methods,
                    datasets: [{
                        data: methodCounts,
                        backgroundColor: [
                            'rgba(61, 90, 128, 0.8)',
                            'rgba(152, 193, 217, 0.8)',
                            'rgba(238, 108, 77, 0.8)',
                            'rgba(41, 50, 65, 0.8)',
                            'rgba(224, 251, 252, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Gráfica de estado de usuarios
        const ctxUsuarios = document.getElementById('chartUsuarios');
        if (ctxUsuarios) {
            new Chart(ctxUsuarios, {
                type: 'bar',
                data: {
                    labels: ['Activos', 'Inactivos'],
                    datasets: [{
                        label: 'Usuarios',
                        data: [activeUsers, inactiveUsers],
                        backgroundColor: [
                            'rgba(40, 167, 69, 0.8)',
                            'rgba(220, 53, 69, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }
    }

    static renderMiniCharts() {
        // Mini gráficas para las tarjetas de estadísticas
        const charts = ['chartUsersMini', 'chartPaymentsMini', 'chartAmountMini', 'chartSystemMini'];
        charts.forEach(chartId => {
            const canvas = document.getElementById(chartId);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['', '', '', '', '', ''],
                        datasets: [{
                            data: [10, 25, 20, 30, 25, 35],
                            borderColor: '#005187',
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            tension: 0.4,
                            pointRadius: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: { enabled: false }
                        },
                        scales: {
                            x: { display: false },
                            y: { display: false }
                        }
                    }
                });
            }
        });
    }
}

