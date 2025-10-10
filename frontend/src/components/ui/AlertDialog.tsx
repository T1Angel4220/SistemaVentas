import React from 'react';
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      default:
        return <Info className="h-6 w-6 text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          title: 'text-green-900',
          message: 'text-green-700',
          confirm: 'bg-green-600 hover:bg-green-700 text-white',
          cancel: 'bg-white hover:bg-green-50 text-green-700 border-green-300'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          title: 'text-yellow-900',
          message: 'text-yellow-700',
          confirm: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          cancel: 'bg-white hover:bg-yellow-50 text-yellow-700 border-yellow-300'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          title: 'text-red-900',
          message: 'text-red-700',
          confirm: 'bg-red-600 hover:bg-red-700 text-white',
          cancel: 'bg-white hover:bg-red-50 text-red-700 border-red-300'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          title: 'text-blue-900',
          message: 'text-blue-700',
          confirm: 'bg-blue-600 hover:bg-blue-700 text-white',
          cancel: 'bg-white hover:bg-blue-50 text-blue-700 border-blue-300'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className={`${colors.bg} ${colors.border} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getIcon()}
              <h3 className={`text-lg font-semibold ${colors.title}`}>
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className={`text-sm ${colors.message} leading-relaxed`}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          {onCancel && (
            <button
              onClick={handleCancel}
              className={`px-4 py-2 rounded-lg font-medium transition-colors border ${colors.cancel}`}
            >
              {cancelText}
            </button>
          )}
          {onConfirm && (
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${colors.confirm}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
