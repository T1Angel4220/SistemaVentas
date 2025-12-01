import React from 'react';
import { createPortal } from 'react-dom';
import { Lock, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onLogout?: () => Promise<void>;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onConfirm,
  onLogout
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    onConfirm();
    // Cerrar sesión si se proporciona la función
    if (onLogout) {
      try {
        await onLogout();
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    }
    // Redirigir al login después de cerrar el modal
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  };

  const modalContent = (
    <>
      {/* Overlay con backdrop blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] animate-[fadeIn_0.2s_ease-out]"
        onClick={handleConfirm}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-[slideInDown_0.3s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con gradiente */}
          <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 rounded-t-2xl overflow-hidden">
            {/* Efecto decorativo de fondo */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            
            {/* Botón cerrar */}
            <button
              onClick={handleConfirm}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icono animado */}
            <div className="relative flex justify-center mb-4">
              <div className="relative">
                {/* Círculo animado de fondo */}
                <div className="absolute inset-0 bg-white/30 rounded-full animate-[ping_1.5s_ease-out_infinite]"></div>
                <div className="relative bg-white rounded-full p-4 shadow-lg animate-[bounceIn_0.5s_ease-out]">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Título */}
            <h2 className="relative text-2xl font-bold text-white text-center mb-2 animate-[fadeIn_0.4s_ease-out_0.1s_both]">
              Contraseña Actualizada
            </h2>
            <p className="relative text-white/90 text-center text-sm animate-[fadeIn_0.4s_ease-out_0.2s_both]">
              Tu contraseña ha sido cambiada exitosamente
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-6 animate-[fadeIn_0.5s_ease-out_0.3s_both]">
            {/* Mensaje informativo */}
            <div className="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-4 mb-6">
              <div className="flex items-start">
                <Lock className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Por seguridad, debes iniciar sesión nuevamente
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Serás redirigido a la página de inicio de sesión en unos momentos.
                  </p>
                </div>
              </div>
            </div>

            {/* Botón de acción */}
            <div className="flex gap-3">
              {/* Botón Aceptar */}
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Iniciar Sesión
              </button>
            </div>

            {/* Información adicional */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Tu nueva contraseña ya está activa
            </p>
          </div>
        </div>
      </div>
    </>
  );

  // Renderizar el modal usando un portal en el body del documento
  return createPortal(modalContent, document.body);
};

