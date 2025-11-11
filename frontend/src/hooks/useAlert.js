import { useState, useCallback } from 'react';
export const useAlert = () => {
    const [alert, setAlert] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });
    const showAlert = useCallback((config) => {
        setAlert({
            ...config,
            isOpen: true
        });
    }, []);
    const hideAlert = useCallback(() => {
        setAlert(prev => ({ ...prev, isOpen: false }));
    }, []);
    const showSuccess = useCallback((title, message, onConfirm, confirmText) => {
        showAlert({
            title,
            message,
            type: 'success',
            confirmText: confirmText || 'Entendido',
            onConfirm
        });
    }, [showAlert]);
    const showWarning = useCallback((title, message, onConfirm, onCancel) => {
        showAlert({
            title,
            message,
            type: 'warning',
            confirmText: 'Confirmar',
            cancelText: 'Cancelar',
            onConfirm,
            onCancel
        });
    }, [showAlert]);
    const showError = useCallback((title, message, onConfirm) => {
        showAlert({
            title,
            message,
            type: 'error',
            confirmText: 'Entendido',
            onConfirm
        });
    }, [showAlert]);
    const showInfo = useCallback((title, message, onConfirm) => {
        showAlert({
            title,
            message,
            type: 'info',
            confirmText: 'Entendido',
            onConfirm
        });
    }, [showAlert]);
    return {
        alert,
        showAlert,
        hideAlert,
        showSuccess,
        showWarning,
        showError,
        showInfo
    };
};
