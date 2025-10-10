import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface VisibilityToggleProps {
  isVisible: boolean;
  onChange: (visible: boolean) => void;
  label?: string;
  className?: string;
}

export const VisibilityToggle: React.FC<VisibilityToggleProps> = ({
  isVisible,
  onChange,
  label = "Visibilidad",
  className = ""
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Eye className="h-4 w-4 mr-2 text-gray-600" />
          {label}
        </label>
      )}
      
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => onChange(!isVisible)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${isVisible 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-gray-300 hover:bg-gray-400'
            }
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-lg
              ${isVisible ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
        
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 ${isVisible ? 'text-green-600' : 'text-gray-500'}`}>
            {isVisible ? (
              <>
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">En Stock</span>
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                <span className="text-sm font-medium">Sin Stock</span>
              </>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            {isVisible ? 'Producto disponible para compra' : 'Producto temporalmente sin stock'}
          </div>
        </div>
      </div>
    </div>
  );
};
