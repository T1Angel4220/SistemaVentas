import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ClockTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const ClockTimePicker: React.FC<ClockTimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = "Selecciona una hora",
  required = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Inicializar valores desde el prop value
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      setHours(h);
      setMinutes(m);
    }
  }, [value]);

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

  const formatTime = (h: number, m: number) => {
    const period = h < 12 ? 'AM' : 'PM';
    const displayHours = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const displayMinutes = m.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  const formatTime24 = (h: number, m: number) => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleConfirm = () => {
    const time24 = formatTime24(hours, minutes);
    onChange(time24);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const getHourAngle = () => {
    // Para tiempo, las horas pueden ser 0, pero el reloj necesita un ángulo válido
    // Si es 0 horas o 12 horas, la manecilla debe apuntar a las 12 (arriba)
    if (hours === 0 || hours === 12 || hours === 24) {
      return 360; // 360 grados = posición 12 (arriba) en SVG
    }
    
    // Para horas de 13 en adelante, calcular el ángulo correctamente
    let displayHours = hours;
    if (hours > 12) {
      displayHours = hours - 12; // 13 horas = 1 en el reloj, 14 = 2, etc.
    }
    
    // Calcular solo el ángulo base de las horas (sin offset de minutos)
    const baseAngle = (displayHours * 30) % 360;
    
    // Convertir al sistema de coordenadas SVG (360 grados = arriba)
    return (baseAngle + 360) % 360;
  };

  const getMinuteAngle = () => {
    if (minutes === 0) {
      return 360; // 360 grados = posición 0 (arriba, donde está el 12) en SVG
    }
    // Convertir al sistema de coordenadas SVG (360 grados = arriba)
    return (minutes * 6 + 360) % 360;
  };

  const getClockPosition = (angle: number, radius: number) => {
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
      // Es para horas (círculo interior)
      const newHours = Math.round(normalizedAngle / 30) % 12;
      // Si el ángulo está cerca de 0 grados (posición 12), establecer horas en 0 o 12
      if (newHours === 0) {
        setHours(12);
      } else {
        setHours(newHours);
      }
    }
  };

  const hourNumbers = Array.from({ length: 12 }, (_, i) => i + 1);

  const minuteNumbers = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700 flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full h-12 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md flex items-center justify-between"
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value ? formatTime(hours, minutes) : placeholder}
        </span>
        <Clock className="h-4 w-4 text-gray-400" />
      </button>

      {/* Modal del reloj */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div 
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">
                    Seleccionar Hora
                  </h3>
                </div>
                <button
                  onClick={handleCancel}
                  className="text-blue-400 hover:text-blue-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Hora actual seleccionada */}
              <div className="mt-3 text-center">
                <div className="text-2xl font-bold text-blue-900">
                  {formatTime(hours, minutes)}
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  Formato 12h
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
                    return (
                      <text
                        key={hour}
                        x={pos.x}
                        y={pos.y + 5}
                        textAnchor="middle"
                        className="text-sm font-medium fill-gray-900 select-none"
                      >
                        {hour}
                      </text>
                    );
                  })}
                  
                  {/* Manecilla de horas */}
                  <line
                    x1="100"
                    y1="100"
                    x2={getClockPosition(getHourAngle(), 40).x}
                    y2={getClockPosition(getHourAngle(), 40).y}
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  
                  {/* Manecilla de minutos */}
                  <line
                    x1="100"
                    y1="100"
                    x2={getClockPosition(getMinuteAngle(), 60).x}
                    y2={getClockPosition(getMinuteAngle(), 60).y}
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  
                  {/* Centro del reloj */}
                  <circle
                    cx="100"
                    cy="100"
                    r="4"
                    fill="#3b82f6"
                  />
                </svg>
              </div>

              {/* Controles numéricos */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Hora</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={hours}
                    onChange={(e) => {
                      let newHour = parseInt(e.target.value) || 0;
                      // Permitir valores de 0 a 24
                      if (newHour < 0) newHour = 0;
                      if (newHour > 24) newHour = 24;
                      setHours(newHour);
                    }}
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                className="px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
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
