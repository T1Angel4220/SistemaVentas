import React from 'react';

interface DurationSelectorProps {
  value: string;
  onChange: (duration: string) => void;
  label: string;
  className?: string;
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  value,
  onChange,
  label,
  className = ""
}) => {
  // Opciones predefinidas de duración
  const durationOptions = [
    { value: '30_minutos', label: '30 minutos' },
    { value: '1_hora', label: '1 hora' },
    { value: '1.5_horas', label: '1.5 horas' },
    { value: '2_horas', label: '2 horas' },
    { value: '3_horas', label: '3 horas' },
    { value: '4_horas', label: '4 horas' },
    { value: '6_horas', label: '6 horas' },
    { value: '8_horas', label: '8 horas' },
    { value: '1_dia', label: '1 día' },
    { value: '2_dias', label: '2 días' },
    { value: '3_dias', label: '3 días' },
    { value: '1_semana', label: '1 semana' },
    { value: '2_semanas', label: '2 semanas' },
    { value: '1_mes', label: '1 mes' },
    { value: 'personalizado', label: 'Personalizado...' }
  ];

  const [customDuration, setCustomDuration] = React.useState('');
  const [showCustomInput, setShowCustomInput] = React.useState(false);

  // Verificar si el valor actual es personalizado
  React.useEffect(() => {
    const isCustom = !durationOptions.some(option => option.value === value && option.value !== 'personalizado');
    setShowCustomInput(isCustom && value !== '');
    if (isCustom && value !== '') {
      setCustomDuration(value);
    }
  }, [value]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === 'personalizado') {
      setShowCustomInput(true);
      setCustomDuration('');
      onChange('');
    } else {
      setShowCustomInput(false);
      onChange(selectedValue);
    }
  };

  const handleCustomDurationChange = (customValue: string) => {
    setCustomDuration(customValue);
    onChange(customValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700 flex items-center">
        {label}
      </label>
      
      <select
        value={showCustomInput ? 'personalizado' : value}
        onChange={(e) => handleSelectChange(e.target.value)}
        className="w-full h-12 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md"
      >
        <option value="">Selecciona una duración</option>
        {durationOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {showCustomInput && (
        <div className="mt-2">
          <input
            type="text"
            value={customDuration}
            onChange={(e) => handleCustomDurationChange(e.target.value)}
            placeholder="Ej: 2.5 horas, 45 minutos, 1 día y medio"
            className="w-full h-12 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md"
          />
          <p className="text-xs text-gray-500 mt-1">
            Describe la duración en términos que tus clientes entiendan
          </p>
        </div>
      )}
    </div>
  );
};
