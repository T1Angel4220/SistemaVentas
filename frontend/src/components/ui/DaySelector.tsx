import React from 'react';
import { Check } from 'lucide-react';

interface DaySelectorProps {
  selectedDays: string[];
  onChange: (days: string[]) => void;
  label: string;
  required?: boolean;
  className?: string;
}

const DAYS = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
];

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDays,
  onChange,
  label,
  required = false,
  className = ""
}) => {
  const handleDayToggle = (day: string) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter(d => d !== day));
    } else {
      onChange([...selectedDays, day]);
    }
  };

  const handleSelectAll = () => {
    if (selectedDays.length === DAYS.length) {
      onChange([]);
    } else {
      onChange(DAYS.map(day => day.value));
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700 flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Botón para seleccionar/deseleccionar todos */}
      <button
        type="button"
        onClick={handleSelectAll}
        className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        {selectedDays.length === DAYS.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
      </button>

      {/* Grid de días */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        {DAYS.map((day) => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => handleDayToggle(day.value)}
              className={`
                relative h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center text-sm font-medium
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              {isSelected && (
                <Check className="absolute top-1 right-1 h-3 w-3 text-blue-600" />
              )}
              <span className="text-xs">{day.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mostrar días seleccionados como texto */}
      {selectedDays.length > 0 && (
        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <span className="font-medium">Días seleccionados:</span>{' '}
            {selectedDays
              .map(day => DAYS.find(d => d.value === day)?.label)
              .filter(Boolean)
              .join(', ')
            }
          </p>
        </div>
      )}
    </div>
  );
};
