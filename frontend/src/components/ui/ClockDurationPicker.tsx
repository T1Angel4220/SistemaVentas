import React, { useState, useRef, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface ClockDurationPickerProps {
  value: string;
  onChange: (duration: string) => void;
  label: string;
  className?: string;
}

export const ClockDurationPicker: React.FC<ClockDurationPickerProps> = ({
  value,
  onChange,
  label,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Inicializar valores desde el prop value
  useEffect(() => {
    if (value) {
      // Parsear diferentes formatos de duración
      const parsed = parseDuration(value);
      setHours(parsed.hours);
      setMinutes(parsed.minutes);
    } else {
      // Si no hay valor, inicializar con 0
      setHours(0);
      setMinutes(0);
    }
  }, [value]);

  // Función para parsear duración en diferentes formatos
  const parseDuration = (duration: string) => {
    let hours = 0;
    let minutes = 0;

    // Formato "X horas Y minutos" o "Xh Ym"
    const hourMatch = duration.match(/(\d+)\s*(hora|hr|h)/i);
    const minuteMatch = duration.match(/(\d+)\s*(minuto|min|m)/i);

    if (hourMatch) {
      hours = parseInt(hourMatch[1]);
    }
    if (minuteMatch) {
      minutes = parseInt(minuteMatch[1]);
    }

    // Si no hay match, intentar formato "HH:MM"
    if (!hourMatch && !minuteMatch) {
      const timeMatch = duration.match(/(\d+):(\d+)/);
      if (timeMatch) {
        hours = parseInt(timeMatch[1]);
        minutes = parseInt(timeMatch[2]);
      }
    }

    return { hours, minutes };
  };

  // Cerrar modal al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const formatDuration = () => {
    if (hours === 0 && minutes === 0) return 'Selecciona duración';
    
    let result = '';
    if (hours > 0) {
      result += `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    if (minutes > 0) {
      if (result) result += ' ';
      result += `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }
    
    return result || '0 minutos';
  };

  const formatDurationShort = () => {
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleConfirm = () => {
    const duration = formatDuration();
    onChange(duration);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const getHourAngle = () => {
    // Para duración, las horas pueden ser 0, pero el reloj necesita un ángulo válido
    // Si es 0 horas, la manecilla debe apuntar a las 12 (arriba)
    if (hours === 0) {
      return 270; // 270 grados = posición 12 (arriba) en SVG
    }
    
    // Para horas de 13 en adelante, calcular el ángulo correctamente
    let displayHours = hours;
    if (hours > 12) {
      displayHours = hours - 12; // 13 horas = 1 en el reloj, 14 = 2, etc.
    }
    
    // Calcular solo el ángulo base de las horas (sin offset de minutos)
    const baseAngle = (displayHours * 30) % 360;
    
    // Convertir al sistema de coordenadas SVG (270 grados = arriba)
    return (baseAngle + 270) % 360;
  };

  const getMinuteAngle = () => {
    if (minutes === 0) {
      return 270; // 270 grados = posición 0 (arriba, donde está el 12) en SVG
    }
    // Convertir al sistema de coordenadas SVG (270 grados = arriba)
    return (minutes * 6 + 270) % 360;
  };

  const getClockPosition = (angle: number, radius: number) => {
    // Convertir ángulo para que 0 grados esté arriba (como un reloj normal)
    const radians = (angle - 90) * (Math.PI / 180);
    return {
      x: 100 + radius * Math.cos(radians),
      y: 100 + radius * Math.sin(radians)
    };
  };

  const handleClockClick = (event: React.MouseEvent<SVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = event.clientX - centerX;
    const y = event.clientY - centerY;
    
    const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    const normalizedAngle = (angle + 360) % 360;
    
    // Determinar si es hora o minuto basado en la distancia del centro
    const distance = Math.sqrt(x * x + y * y);
    const clockRadius = rect.width / 2;
    
    if (distance > clockRadius * 0.3) {
      // Es para minutos (círculo exterior)
      const newMinutes = Math.round(normalizedAngle / 6) % 60;
      setMinutes(newMinutes);
    } else {
      // Es para horas (círculo interior) - para duración
      const newHours = Math.round(normalizedAngle / 30) % 12;
      // Si el ángulo está cerca de 0 grados (posición 12), establecer horas en 0
      if (newHours === 0) {
        setHours(0);
      } else {
        setHours(newHours);
      }
    }
  };

  const hourNumbers = Array.from({ length: 12 }, (_, i) => i);
  const minuteNumbers = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700 flex items-center">
        {label}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full h-12 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md flex items-center justify-between"
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value ? value : 'Selecciona duración'}
        </span>
        <Timer className="h-4 w-4 text-gray-400" />
      </button>

      {/* Modal del reloj */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div 
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="bg-green-50 border-b border-green-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Timer className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">
                    Seleccionar Duración
                  </h3>
                </div>
                <button
                  onClick={handleCancel}
                  className="text-green-400 hover:text-green-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Duración actual seleccionada */}
              <div className="mt-3 text-center">
                <div className="text-2xl font-bold text-green-900">
                  {formatDurationShort()}
                </div>
                <div className="text-sm text-green-600 mt-1">
                  {formatDuration()}
                </div>
              </div>
            </div>

            {/* Contenido del reloj */}
            <div className="p-6">
              {/* Reloj visual */}
              <div className="flex justify-center">
                <svg
                  width="200"
                  height="200"
                  viewBox="0 0 200 200"
                  className="cursor-pointer"
                  onClick={handleClockClick}
                >
                  {/* Círculo exterior */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  
                  {/* Números de minutos */}
                  {minuteNumbers.map((minute) => {
                    // Ajustar el ángulo para que el 0 esté arriba (90 grados)
                    const angle = (minute * 6) % 360;
                    const pos = getClockPosition(angle, 75);
                    return (
                      <text
                        key={minute}
                        x={pos.x}
                        y={pos.y + 5}
                        textAnchor="middle"
                        className="text-xs fill-gray-600 select-none"
                      >
                        {minute}
                      </text>
                    );
                  })}
                  
                  {/* Números de horas */}
                  {hourNumbers.map((hour) => {
                    // Ajustar el ángulo para que el 12 esté arriba (90 grados)
                    const angle = (hour * 30) % 360;
                    const pos = getClockPosition(angle, 55);
                    const displayHour = hour === 0 ? 12 : hour;
                    return (
                      <text
                        key={hour}
                        x={pos.x}
                        y={pos.y + 5}
                        textAnchor="middle"
                        className="text-sm font-medium fill-gray-900 select-none"
                      >
                        {displayHour}
                      </text>
                    );
                  })}
                  
                  {/* Manecilla de horas */}
                  <line
                    x1="100"
                    y1="100"
                    x2={getClockPosition(getHourAngle() + 90, 40).x}
                    y2={getClockPosition(getHourAngle() + 90, 40).y}
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  
                  {/* Manecilla de minutos */}
                  <line
                    x1="100"
                    y1="100"
                    x2={getClockPosition(getMinuteAngle() + 90, 60).x}
                    y2={getClockPosition(getMinuteAngle() + 90, 60).y}
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  
                  {/* Centro del reloj */}
                  <circle
                    cx="100"
                    cy="100"
                    r="4"
                    fill="#10b981"
                  />
                </svg>
              </div>

              {/* Controles numéricos */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Horas</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={hours}
                    onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Minutos</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="5"
                    value={minutes}
                    onChange={(e) => {
                      let val = parseInt(e.target.value) || 0;
                      // Wrap-around: si es menor que 0, va a 59; si es mayor que 59, va a 0
                      if (val < 0) {
                        val = 59;
                      } else if (val > 59) {
                        val = 0;
                      }
                      setMinutes(val);
                    }}
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Opciones rápidas */}
              <div className="mt-4">
                <label className="text-xs text-gray-600 mb-2 block">Opciones rápidas</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { h: 0, m: 30, label: '30min' },
                    { h: 1, m: 0, label: '1h' },
                    { h: 1, m: 30, label: '1.5h' },
                    { h: 2, m: 0, label: '2h' },
                    { h: 3, m: 0, label: '3h' },
                    { h: 4, m: 0, label: '4h' }
                  ].map((option) => {
                    const isSelected = hours === option.h && minutes === option.m;
                    return (
                      <button
                        key={option.label}
                        onClick={() => {
                          setHours(option.h);
                          setMinutes(option.m);
                        }}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          isSelected 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg font-medium transition-colors border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-lg font-medium transition-colors bg-green-600 hover:bg-green-700 text-white"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
