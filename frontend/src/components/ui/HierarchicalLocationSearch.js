import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, AlertCircle } from 'lucide-react';
const HierarchicalLocationSearch = ({ locations, onLocationSelect, loading = false, error, initialProvincia = '', initialCanton = '', initialDistrito = '', initialDireccion = '', errors = {} }) => {
    const [selectedProvincia, setSelectedProvincia] = useState(initialProvincia);
    const [selectedCanton, setSelectedCanton] = useState(initialCanton);
    const [distrito, setDistrito] = useState(initialDistrito);
    const [direccion, setDireccion] = useState(initialDireccion);
    // Obtener lista única de provincias
    const provincias = React.useMemo(() => {
        const uniqueProvincias = Array.from(new Set(locations.map(loc => loc.provincia))).sort();
        return uniqueProvincias;
    }, [locations]);
    // Obtener cantones filtrados por provincia seleccionada
    const cantones = React.useMemo(() => {
        if (!selectedProvincia)
            return [];
        const cantonesForProvincia = locations
            .filter(loc => loc.provincia === selectedProvincia)
            .map(loc => loc.canton)
            .filter((canton, index, self) => self.indexOf(canton) === index)
            .sort();
        return cantonesForProvincia;
    }, [locations, selectedProvincia]);
    // Actualizar valores iniciales cuando cambien (incluyendo cuando se limpian)
    useEffect(() => {
        setSelectedProvincia(initialProvincia);
        setSelectedCanton(initialCanton);
        setDistrito(initialDistrito);
        setDireccion(initialDireccion);
    }, [initialProvincia, initialCanton, initialDistrito, initialDireccion]);
    // Notificar cuando se limpian todos los filtros (por separado para evitar bucle)
    useEffect(() => {
        if (!initialProvincia && !initialCanton && !initialDistrito && !initialDireccion &&
            (selectedProvincia || selectedCanton || distrito || direccion)) {
            // Solo notificar si realmente había algo seleccionado antes
            onLocationSelect({
                locationId: '',
                provincia: '',
                canton: '',
                distrito: '',
                direccion: ''
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialProvincia, initialCanton, initialDistrito, initialDireccion]);
    // Manejar cambio de provincia
    const handleProvinciaChange = (provincia) => {
        setSelectedProvincia(provincia);
        setSelectedCanton(''); // Reset cantón cuando cambia provincia
        // Notificar cambio
        notifyChange(provincia, '', distrito, direccion);
    };
    // Manejar cambio de cantón
    const handleCantonChange = (canton) => {
        setSelectedCanton(canton);
        // Buscar el ID de ubicación
        const location = locations.find(loc => loc.provincia === selectedProvincia && loc.canton === canton);
        // Notificar cambio
        notifyChange(selectedProvincia, canton, distrito, direccion, location?.id.toString());
    };
    // Manejar cambio de distrito
    const handleDistritoChange = (newDistrito) => {
        setDistrito(newDistrito);
        notifyChange(selectedProvincia, selectedCanton, newDistrito, direccion);
    };
    // Manejar cambio de dirección
    const handleDireccionChange = (newDireccion) => {
        setDireccion(newDireccion);
        notifyChange(selectedProvincia, selectedCanton, distrito, newDireccion);
    };
    // Función auxiliar para notificar cambios
    const notifyChange = (prov, cant, dist, dir, locId) => {
        // Notificar inmediatamente cuando hay provincia (filtrado progresivo)
        // Si no hay provincia, notificar con valores vacíos para limpiar filtros
        const location = (prov && cant) ? (locId || locations.find(loc => loc.provincia === prov && loc.canton === cant)?.id.toString() || '') : '';
        onLocationSelect({
            locationId: location,
            provincia: prov,
            canton: cant,
            distrito: dist,
            direccion: dir
        });
    };
    if (loading) {
        return (_jsxs("div", { className: "flex items-center justify-center p-4", children: [_jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-2 text-sm text-gray-600", children: "Cargando ubicaciones..." })] }));
    }
    if (error) {
        return (_jsx("div", { className: "p-4 bg-red-50 border border-red-200 rounded-md", children: _jsx("p", { className: "text-sm text-red-600", children: error }) }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(MapPin, { className: "h-4 w-4 inline mr-1" }), "Provincia *"] }), _jsxs("div", { className: "relative", children: [_jsxs("select", { value: selectedProvincia, onChange: (e) => handleProvinciaChange(e.target.value), className: "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10 transition-colors", required: true, children: [_jsx("option", { value: "", children: "Selecciona una provincia" }), provincias.map((provincia) => (_jsx("option", { value: provincia, children: provincia }, provincia)))] }), _jsx(ChevronDown, { className: "absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Cant\u00F3n *" }), _jsxs("div", { className: "relative", children: [_jsxs("select", { value: selectedCanton, onChange: (e) => handleCantonChange(e.target.value), disabled: !selectedProvincia || cantones.length === 0, className: `w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10 transition-colors ${!selectedProvincia || cantones.length === 0
                                    ? 'bg-gray-100 cursor-not-allowed opacity-60'
                                    : ''}`, required: true, children: [_jsx("option", { value: "", children: !selectedProvincia
                                            ? 'Primero selecciona una provincia'
                                            : 'Selecciona un cantón' }), cantones.map((canton) => (_jsx("option", { value: canton, children: canton }, canton)))] }), _jsx(ChevronDown, { className: "absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" })] }), selectedProvincia && cantones.length === 0 && (_jsx("p", { className: "mt-1 text-sm text-gray-500", children: "No hay cantones disponibles para esta provincia" }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Distrito / Parroquia *" }), _jsx("input", { type: "text", value: distrito, onChange: (e) => handleDistritoChange(e.target.value), placeholder: "Ej: Centro, Norte, Sur...", className: `w-full px-4 py-2.5 border rounded-lg transition-colors ${errors.distrito
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50'
                            : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}` }), errors.distrito && (_jsxs("p", { className: "text-red-500 text-xs font-medium flex items-center mt-1", children: [_jsx(AlertCircle, { className: "h-3 w-3 mr-1" }), errors.distrito] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Direcci\u00F3n Espec\u00EDfica *" }), _jsx("input", { type: "text", value: direccion, onChange: (e) => handleDireccionChange(e.target.value), placeholder: "Ej: Av. Principal y Calle Secundaria", className: `w-full px-4 py-2.5 border rounded-lg transition-colors ${errors.direccion
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50'
                            : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}` }), errors.direccion ? (_jsxs("p", { className: "text-red-500 text-xs font-medium flex items-center mt-1", children: [_jsx(AlertCircle, { className: "h-3 w-3 mr-1" }), errors.direccion] })) : (_jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Puedes incluir calles, referencias, n\u00FAmero de casa, etc." }))] }), selectedProvincia && (_jsxs("div", { className: "mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg", children: [_jsxs("p", { className: "text-sm font-medium text-blue-900", children: ["\uD83D\uDCCD ", selectedCanton ? 'Ubicación seleccionada' : 'Filtrando por provincia', ":"] }), _jsxs("p", { className: "text-sm text-blue-700 mt-1", children: [selectedProvincia, selectedCanton && ` → ${selectedCanton}`, distrito && ` → ${distrito}`, direccion && ` (${direccion})`] })] }))] }));
};
export default HierarchicalLocationSearch;
