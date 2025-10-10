import { useState, useCallback } from 'react';

interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const useAlert = () => {
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = useCallback((config: Omit<AlertState, 'isOpen'>) => {
    setAlert({
      ...config,
      isOpen: true
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showSuccess = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showAlert({
      title,
      message,
      type: 'success',
      confirmText: 'Entendido',
      onConfirm
    });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message: string, onConfirm?: () => void, onCancel?: () => void) => {
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

  const showError = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showAlert({
      title,
      message,
      type: 'error',
      confirmText: 'Entendido',
      onConfirm
    });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message: string, onConfirm?: () => void) => {
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
