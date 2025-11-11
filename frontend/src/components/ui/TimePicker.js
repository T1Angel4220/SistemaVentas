import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const TimePicker = ({ value, onChange, placeholder = "Selecciona una hora", label, required = false, className = "" }) => {
    // Generar opciones de hora cada 30 minutos
    const generateTimeOptions = () => {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const displayTime = `${hour === 0 ? '12' : hour > 12 ? (hour - 12).toString() : hour.toString()}:${minute.toString().padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
                options.push({ value: timeString, label: displayTime });
            }
        }
        return options;
    };
    return (_jsxs("div", { className: `space-y-2 ${className}`, children: [_jsxs("label", { className: "text-sm font-medium text-gray-700 flex items-center", children: [label, required && _jsx("span", { className: "text-red-500 ml-1", children: "*" })] }), _jsxs("select", { value: value, onChange: (e) => onChange(e.target.value), className: "w-full h-12 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md", children: [_jsx("option", { value: "", children: placeholder }), generateTimeOptions().map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] })] }));
};
