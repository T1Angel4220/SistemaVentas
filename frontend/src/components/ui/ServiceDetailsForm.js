import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ClockTimePicker } from './ClockTimePicker';
import { DaySelector } from './DaySelector';
import { ClockDurationPicker } from './ClockDurationPicker';
import { Clock, Calendar, Timer } from 'lucide-react';
export const ServiceDetailsForm = ({ horarioInicio, horarioFin, diasDisponibles, duracionEstimada, onHorarioInicioChange, onHorarioFinChange, onDiasDisponiblesChange, onDuracionEstimadaChange, className = "" }) => {
    // Función para convertir tiempo 24h a 12h para mostrar
    const formatTimeForDisplay = (time24) => {
        if (!time24)
            return '';
        const [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };
    return (_jsxs("div", { className: `space-y-6 ${className}`, children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "h-4 w-4 text-gray-600" }), _jsx("h4", { className: "text-sm font-medium text-gray-700", children: "Horario de Atenci\u00F3n *" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(ClockTimePicker, { label: "Desde", value: horarioInicio, onChange: onHorarioInicioChange, placeholder: "Hora de inicio", required: true }), _jsx(ClockTimePicker, { label: "Hasta", value: horarioFin, onChange: onHorarioFinChange, placeholder: "Hora de fin", required: true })] }), horarioInicio && horarioFin && (_jsx("div", { className: "p-3 bg-blue-50 rounded-lg border border-blue-200", children: _jsxs("p", { className: "text-sm text-blue-800", children: [_jsx("span", { className: "font-medium", children: "Horario configurado:" }), ' ', formatTimeForDisplay(horarioInicio), " - ", formatTimeForDisplay(horarioFin)] }) }))] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-gray-600" }), _jsx("h4", { className: "text-sm font-medium text-gray-700", children: "D\u00EDas Disponibles *" })] }), _jsx(DaySelector, { label: "", selectedDays: diasDisponibles, onChange: onDiasDisponiblesChange, required: true })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Timer, { className: "h-4 w-4 text-gray-600" }), _jsx("h4", { className: "text-sm font-medium text-gray-700", children: "Duraci\u00F3n Estimada *" })] }), _jsx(ClockDurationPicker, { label: "", value: duracionEstimada, onChange: onDuracionEstimadaChange, required: true })] }), (horarioInicio || horarioFin || diasDisponibles.length > 0 || duracionEstimada) && (_jsxs("div", { className: "mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200", children: [_jsx("h5", { className: "text-sm font-semibold text-green-800 mb-2", children: "Resumen del Servicio" }), _jsxs("div", { className: "space-y-1 text-sm text-green-700", children: [horarioInicio && horarioFin && (_jsxs("p", { children: ["\uD83D\uDD50 ", _jsx("span", { className: "font-medium", children: "Horario:" }), " ", formatTimeForDisplay(horarioInicio), " - ", formatTimeForDisplay(horarioFin)] })), diasDisponibles.length > 0 && (_jsxs("p", { children: ["\uD83D\uDCC5 ", _jsx("span", { className: "font-medium", children: "D\u00EDas:" }), " ", diasDisponibles.map(day => {
                                        const dayNames = {
                                            'lunes': 'Lunes', 'martes': 'Martes', 'miercoles': 'Miércoles',
                                            'jueves': 'Jueves', 'viernes': 'Viernes', 'sabado': 'Sábado', 'domingo': 'Domingo'
                                        };
                                        return dayNames[day];
                                    }).join(', ')] })), duracionEstimada && (_jsxs("p", { children: ["\u23F1\uFE0F ", _jsx("span", { className: "font-medium", children: "Duraci\u00F3n:" }), " ", duracionEstimada] }))] })] }))] }));
};
