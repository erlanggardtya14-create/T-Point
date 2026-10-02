import Swal from 'sweetalert2';

export const swalMessage = ({
    title,
    text = '',
    type = 'success',
    confirmText = 'OK',
    cancelText = 'Tidak',
    timer,
    showConfirmButton = true,
    showCancelButton = false,
}) => {
    return Swal.fire({
        icon: type,
        title,
        text,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        showConfirmButton,
        showCancelButton,
        timer,
        timerProgressBar: !!timer,
        allowOutsideClick: false,
        allowEscapeKey: true,
        confirmButtonColor:
            type === 'success'
                ? '#16a34a'
                : type === 'error'
                    ? '#dc2626'
                    : '#f60',
        cancelButtonColor: '#6b7280',
        showClass: {
            popup: 'swal2-show',
        },
        hideClass: {
            popup: 'swal2-hide',
        },
    });
};
