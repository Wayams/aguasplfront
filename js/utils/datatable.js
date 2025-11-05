// Utilidades para DataTables
export class DataTableUtils {
    static init(tableId, options = {}) {
        const defaultOptions = {
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json',
                emptyTable: '<i class="bi bi-inbox"></i> No hay datos disponibles en la tabla'
            },
            responsive: true,
            pageLength: 10,
            lengthMenu: [[10, 25, 50, -1], [10, 25, 50, 'Todos']],
            order: [[0, 'desc']],
            dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip',
            autoWidth: false,
            ...options
        };

        // Limpiar y preparar la tabla antes de inicializar DataTables
        const table = $(`#${tableId}`);
        if (!table.length) {
            console.warn(`Tabla con id "${tableId}" no encontrada`);
            return null;
        }

        // Verificar que el thead existe y tiene columnas
        const headerRow = table.find('thead tr:first');
        if (!headerRow.length) {
            console.warn(`Tabla "${tableId}" no tiene thead`);
            return null;
        }

        const columnCount = headerRow.find('th').length;
        if (columnCount === 0) {
            console.warn(`Tabla "${tableId}" no tiene columnas en el thead`);
            return null;
        }

        // Remover filas con colspan o que no tengan el número correcto de celdas
        table.find('tbody tr').each(function() {
            const $row = $(this);
            const cellCount = $row.find('td').length;
            const $tdWithColspan = $row.find('td[colspan]');
            
            // Si la fila tiene colspan o número incorrecto de celdas, removerla
            if ($tdWithColspan.length > 0 || (cellCount > 0 && cellCount !== columnCount)) {
                $row.remove();
            }
        });

        // Inicializar DataTables
        try {
            return table.DataTable(defaultOptions);
        } catch (error) {
            console.error(`Error inicializando DataTable en "${tableId}":`, error);
            return null;
        }
    }

    static destroy(tableId) {
        try {
            const table = $(`#${tableId}`);
            if (table.length && $.fn.DataTable && $.fn.DataTable.isDataTable(`#${tableId}`)) {
                table.DataTable().destroy();
            }
        } catch (error) {
            console.warn(`Error al destruir DataTable "${tableId}":`, error);
        }
    }

    static reinit(tableId, options = {}) {
        this.destroy(tableId);
        return this.init(tableId, options);
    }
}

