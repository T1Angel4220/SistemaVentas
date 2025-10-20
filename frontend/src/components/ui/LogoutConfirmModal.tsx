import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  userName?: string;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  userName = 'Usuario'
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay con backdrop blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-[fadeIn_0.2s_ease-out]"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-[slideInDown_0.3s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con gradiente */}
          <div className="relative bg-gradient-to-r from-orange-500 to-red-600 px-6 py-8 rounded-t-2xl overflow-hidden">
            {/* Efecto decorativo de fondo */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            
            {/* Botón cerrar */}
            <button
              onClick={onCancel}
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
                  <LogOut className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Título */}
            <h2 className="relative text-2xl font-bold text-white text-center mb-2 animate-[fadeIn_0.4s_ease-out_0.1s_both]">
              ¿Cerrar Sesión?
            </h2>
            <p className="relative text-white/90 text-center text-sm animate-[fadeIn_0.4s_ease-out_0.2s_both]">
              {userName}
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-6 animate-[fadeIn_0.5s_ease-out_0.3s_both]">
            {/* Mensaje de advertencia */}
            <div className="bg-orange-50 border-l-4 border-orange-400 rounded-r-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Estás a punto de cerrar tu sesión
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    Tendrás que iniciar sesión nuevamente para acceder a tu cuenta.
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              {/* Botón Cancelar */}
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 hover:shadow-md active:scale-95"
              >
                Cancelar
              </button>

              {/* Botón Cerrar Sesión */}
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>

            {/* Información adicional */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Tu información estará segura y podrás volver cuando quieras
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

