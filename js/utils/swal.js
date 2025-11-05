// Utilidades para SweetAlert2
export class SwalUtils {
    static async confirm(title, text = '', icon = 'warning') {
        const result = await Swal.fire({
            title: title,
            text: text,
            icon: icon,
            showCancelButton: true,
            confirmButtonColor: '#005187',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });
        return result.isConfirmed;
    }

    static success(message, title = 'Éxito') {
        Swal.fire({
            title: title,
            text: message,
            icon: 'success',
            confirmButtonColor: '#005187',
            timer: 3000,
            timerProgressBar: true
        });
    }

    static error(message, title = 'Error') {
        Swal.fire({
            title: title,
            text: message,
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    }

    static warning(message, title = 'Advertencia') {
        Swal.fire({
            title: title,
            text: message,
            icon: 'warning',
            confirmButtonColor: '#ffc107'
        });
    }

    static info(message, title = 'Información') {
        Swal.fire({
            title: title,
            text: message,
            icon: 'info',
            confirmButtonColor: '#17a2b8'
        });
    }

    static loading(message = 'Cargando...') {
        Swal.fire({
            title: message,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    static close() {
        Swal.close();
    }
}

