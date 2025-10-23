import React from 'react';
import { ShieldX, AlertTriangle } from 'lucide-react';

interface GlobalSuspendedAlertProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSuspendedAlert: React.FC<GlobalSuspendedAlertProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onClose();
    // Redirigir al login
    window.location.href = '/login';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay - más oscuro para mayor énfasis */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        
        {/* Header con gradiente rojo intenso */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-700 px-6 py-5">
          <div className="flex items-center space-x-4">
            {/* Icono animado */}
            <div className="bg-white/20 p-3 rounded-full animate-pulse">
              <ShieldX className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-white">
                Cuenta Suspendida
              </h3>
              <p className="text-white/90 text-sm mt-1 font-medium">
                Acción administrativa
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="space-y-4">
            <p className="text-gray-800 text-base leading-relaxed font-medium">
              Tu cuenta ha sido <strong className="text-red-600">suspendida por un administrador o moderador</strong> debido al incumplimiento de las políticas de uso del sistema.
            </p>
            
            {/* Panel de advertencia */}
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-900 font-bold">
                    Acceso Denegado
                  </p>
                  <p className="text-sm text-red-800 mt-1 leading-relaxed">
                    No puedes acceder al sistema mientras tu cuenta permanezca suspendida. Tus sesiones activas han sido cerradas automáticamente.
                  </p>
                </div>
              </div>
            </div>

            {/* Panel informativo */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-900 font-bold">
                    ¿Qué hacer ahora?
                  </p>
                  <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                    Por favor, contacta con el administrador del sistema para obtener más información sobre tu situación y los pasos a seguir para resolver este problema.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end border-t border-gray-200">
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

