import React, { useState } from 'react';
import { Button } from './Button';
import { AlertTriangle, XCircle, Shield, CheckCircle, X } from 'lucide-react';

interface ModerationReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  action: 'rechazar' | 'suspender' | 'marcar_peligroso';
  productName: string;
}

export const ModerationReasonModal: React.FC<ModerationReasonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  productName
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const getActionConfig = () => {
    switch (action) {
      case 'rechazar':
        return {
          icon: <XCircle className="h-8 w-8 text-orange-500" />,
          emoji: '🔴',
          title: 'RECHAZAR PRODUCTO',
          color: 'orange',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800',
          message: 'El producto será marcado como RECHAZADO.',
          canDo: [
            'Ver el producto en su lista',
            'Editarlo para corregir problemas',
            'Eliminarlo si lo desea',
            'Apelar esta decisión'
          ],
          cantDo: []
        };
      case 'suspender':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-yellow-500" />,
          emoji: '🟡',
          title: 'SUSPENDER PRODUCTO',
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          message: 'El producto será SUSPENDIDO temporalmente.',
          canDo: [
            'Ver el producto en su lista',
            'Apelar esta decisión'
          ],
          cantDo: [
            'Editarlo hasta que se resuelva',
            'Eliminarlo hasta que se resuelva'
          ]
        };
      case 'marcar_peligroso':
        return {
          icon: <Shield className="h-8 w-8 text-red-600" />,
          emoji: '🚫',
          title: 'MARCAR COMO PELIGROSO',
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          message: '⚠️ ATENCIÓN: Esta es una acción crítica.',
          canDo: [
            'Apelar esta decisión'
          ],
          cantDo: [
            'Verlo en su lista',
            'Editarlo',
            'Eliminarlo (solo admins)'
          ],
          hiddenMessage: 'Será OCULTO completamente para vendedor y compradores. Solo visible para moderadores/admins.'
        };
      default:
        return {
          icon: <Shield className="h-8 w-8" />,
          emoji: '',
          title: '',
          color: 'gray',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          message: '',
          canDo: [],
          cantDo: []
        };
    }
  };

  const config = getActionConfig();

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Debes proporcionar un motivo para continuar');
      return;
    }
    onConfirm(reason);
    setReason('');
    setError('');
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl animate-slideIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`${config.bgColor} ${config.borderColor} border-b-2 rounded-t-2xl p-6 relative`}>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            {config.icon}
            <div>
              <h2 className={`text-2xl font-bold ${config.textColor}`}>
                {config.emoji} {config.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1 font-medium">
                "{productName}"
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Message */}
          <div className={`${config.bgColor} ${config.borderColor} border-l-4 rounded p-4`}>
            <p className={`${config.textColor} font-semibold text-base`}>
              {config.message}
            </p>
            {config.hiddenMessage && (
              <p className={`${config.textColor} text-sm mt-2`}>
                {config.hiddenMessage}
              </p>
            )}
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            {/* Can Do */}
            {config.canDo.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-bold text-green-800">El vendedor PODRÁ:</h3>
                </div>
                <ul className="space-y-2 ml-7">
                  {config.canDo.map((item, index) => (
                    <li key={index} className="text-sm text-green-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Can't Do */}
            {config.cantDo.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <h3 className="font-bold text-red-800">El vendedor NO PODRÁ:</h3>
                </div>
                <ul className="space-y-2 ml-7">
                  {config.cantDo.map((item, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Input Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Motivo (obligatorio) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder="Explica el motivo de esta acción..."
              className={`w-full h-32 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                error 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
              autoFocus
            />
            {error && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 rounded-b-2xl p-6 flex justify-end space-x-3 border-t border-gray-200">
          <Button
            onClick={handleClose}
            variant="outline"
            className="px-6 py-2.5 border-2 border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-all"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className={`px-6 py-2.5 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all ${
              action === 'rechazar' 
                ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                : action === 'suspender'
                ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800'
                : 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950'
            }`}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
};

