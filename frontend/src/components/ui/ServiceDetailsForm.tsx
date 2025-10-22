import React from 'react';
import { ClockTimePicker } from './ClockTimePicker';
import { DaySelector } from './DaySelector';
import { ClockDurationPicker } from './ClockDurationPicker';
import { Clock, Calendar, Timer } from 'lucide-react';

interface ServiceDetailsFormProps {
  horarioInicio: string;
  horarioFin: string;
  diasDisponibles: string[];
  duracionEstimada: string;
  onHorarioInicioChange: (time: string) => void;
  onHorarioFinChange: (time: string) => void;
  onDiasDisponiblesChange: (days: string[]) => void;
  onDuracionEstimadaChange: (duration: string) => void;
  className?: string;
}

export const ServiceDetailsForm: React.FC<ServiceDetailsFormProps> = ({
  horarioInicio,
  horarioFin,
  diasDisponibles,
  duracionEstimada,
  onHorarioInicioChange,
  onHorarioFinChange,
  onDiasDisponiblesChange,
  onDuracionEstimadaChange,
  className = ""
}) => {
  // Función para convertir tiempo 24h a 12h para mostrar
  const formatTimeForDisplay = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Horario de Atención */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-600" />
          <h4 className="text-sm font-medium text-gray-700">Horario de Atención *</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ClockTimePicker
            label="Desde"
            value={horarioInicio}
            onChange={onHorarioInicioChange}
            placeholder="Hora de inicio"
            required
          />
          
          <ClockTimePicker
            label="Hasta"
            value={horarioFin}
            onChange={onHorarioFinChange}
            placeholder="Hora de fin"
            required
          />
        </div>

        {/* Mostrar horario seleccionado */}
        {horarioInicio && horarioFin && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Horario configurado:</span>{' '}
              {formatTimeForDisplay(horarioInicio)} - {formatTimeForDisplay(horarioFin)}
            </p>
          </div>
        )}
      </div>

      {/* Días Disponibles */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <h4 className="text-sm font-medium text-gray-700">Días Disponibles *</h4>
        </div>
        
        <DaySelector
          label=""
          selectedDays={diasDisponibles}
          onChange={onDiasDisponiblesChange}
          required
        />
      </div>

      {/* Duración Estimada */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Timer className="h-4 w-4 text-gray-600" />
          <h4 className="text-sm font-medium text-gray-700">Duración Estimada *</h4>
        </div>
        
        <ClockDurationPicker
          label=""
          value={duracionEstimada}
          onChange={onDuracionEstimadaChange}
          required
        />
      </div>

      {/* Resumen del Servicio */}
      {(horarioInicio || horarioFin || diasDisponibles.length > 0 || duracionEstimada) && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <h5 className="text-sm font-semibold text-green-800 mb-2">Resumen del Servicio</h5>
          <div className="space-y-1 text-sm text-green-700">
            {horarioInicio && horarioFin && (
              <p>🕐 <span className="font-medium">Horario:</span> {formatTimeForDisplay(horarioInicio)} - {formatTimeForDisplay(horarioFin)}</p>
            )}
            {diasDisponibles.length > 0 && (
              <p>📅 <span className="font-medium">Días:</span> {diasDisponibles.map(day => {
                const dayNames: { [key: string]: string } = {
                  'lunes': 'Lunes', 'martes': 'Martes', 'miercoles': 'Miércoles', 
                  'jueves': 'Jueves', 'viernes': 'Viernes', 'sabado': 'Sábado', 'domingo': 'Domingo'
                };
                return dayNames[day];
              }).join(', ')}</p>
            )}
            {duracionEstimada && (
              <p>⏱️ <span className="font-medium">Duración:</span> {duracionEstimada}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
