import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Check } from 'lucide-react';
const DAYS = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' }
];
export const DaySelector = ({ selectedDays, onChange, label, required = false, className = "" }) => {
    const handleDayToggle = (day) => {
        if (selectedDays.includes(day)) {
            onChange(selectedDays.filter(d => d !== day));
        }
        else {
            onChange([...selectedDays, day]);
        }
    };
    const handleSelectAll = () => {
        if (selectedDays.length === DAYS.length) {
            onChange([]);
        }
        else {
            onChange(DAYS.map(day => day.value));
        }
    };
    return (_jsxs("div", { className: `space-y-2 ${className}`, children: [_jsxs("label", { className: "text-sm font-medium text-gray-700 flex items-center", children: [label, required && _jsx("span", { className: "text-red-500 ml-1", children: "*" })] }), _jsx("button", { type: "button", onClick: handleSelectAll, className: "text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors", children: selectedDays.length === DAYS.length ? 'Deseleccionar todos' : 'Seleccionar todos' }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2", children: DAYS.map((day) => {
                    const isSelected = selectedDays.includes(day.value);
                    return (_jsxs("button", { type: "button", onClick: () => handleDayToggle(day.value), className: `
                relative h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center text-sm font-medium
                ${isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
              `, children: [isSelected && (_jsx(Check, { className: "absolute top-1 right-1 h-3 w-3 text-blue-600" })), _jsx("span", { className: "text-xs", children: day.label })] }, day.value));
                }) }), selectedDays.length > 0 && (_jsx("div", { className: "mt-2 p-2 bg-blue-50 rounded-lg", children: _jsxs("p", { className: "text-xs text-blue-700", children: [_jsx("span", { className: "font-medium", children: "D\u00EDas seleccionados:" }), ' ', selectedDays
                            .map(day => DAYS.find(d => d.value === day)?.label)
                            .filter(Boolean)
                            .join(', ')] }) }))] }));
};
