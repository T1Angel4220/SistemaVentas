import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const DurationSelector = ({ value, onChange, label, className = "" }) => {
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
    const handleSelectChange = (selectedValue) => {
        if (selectedValue === 'personalizado') {
            setShowCustomInput(true);
            setCustomDuration('');
            onChange('');
        }
        else {
            setShowCustomInput(false);
            onChange(selectedValue);
        }
    };
    const handleCustomDurationChange = (customValue) => {
        setCustomDuration(customValue);
        onChange(customValue);
    };
    return (_jsxs("div", { className: `space-y-2 ${className}`, children: [_jsx("label", { className: "text-sm font-medium text-gray-700 flex items-center", children: label }), _jsxs("select", { value: showCustomInput ? 'personalizado' : value, onChange: (e) => handleSelectChange(e.target.value), className: "w-full h-12 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md", children: [_jsx("option", { value: "", children: "Selecciona una duraci\u00F3n" }), durationOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }), showCustomInput && (_jsxs("div", { className: "mt-2", children: [_jsx("input", { type: "text", value: customDuration, onChange: (e) => handleCustomDurationChange(e.target.value), placeholder: "Ej: 2.5 horas, 45 minutos, 1 d\u00EDa y medio", className: "w-full h-12 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Describe la duraci\u00F3n en t\u00E9rminos que tus clientes entiendan" })] }))] }));
};
