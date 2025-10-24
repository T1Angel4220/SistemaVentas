import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

export interface Location {
  id: number;
  nombre: string;
  provincia: string;
  canton: string;
  distrito?: string;
}

interface HierarchicalLocationSearchProps {
  locations: Location[];
  onLocationSelect: (locationData: {
    locationId: string;
    provincia: string;
    canton: string;
    distrito: string;
    direccion: string;
  }) => void;
  loading?: boolean;
  error?: string;
  // Valores iniciales para edición
  initialProvincia?: string;
  initialCanton?: string;
  initialDistrito?: string;
  initialDireccion?: string;
}

const HierarchicalLocationSearch: React.FC<HierarchicalLocationSearchProps> = ({
  locations,
  onLocationSelect,
  loading = false,
  error,
  initialProvincia = '',
  initialCanton = '',
  initialDistrito = '',
  initialDireccion = ''
}) => {
  const [selectedProvincia, setSelectedProvincia] = useState(initialProvincia);
  const [selectedCanton, setSelectedCanton] = useState(initialCanton);
  const [distrito, setDistrito] = useState(initialDistrito);
  const [direccion, setDireccion] = useState(initialDireccion);

  // Obtener lista única de provincias
  const provincias = React.useMemo(() => {
    const uniqueProvincias = Array.from(
      new Set(locations.map(loc => loc.provincia))
    ).sort();
    return uniqueProvincias;
  }, [locations]);

  // Obtener cantones filtrados por provincia seleccionada
  const cantones = React.useMemo(() => {
    if (!selectedProvincia) return [];
    
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
  const handleProvinciaChange = (provincia: string) => {
    setSelectedProvincia(provincia);
    setSelectedCanton(''); // Reset cantón cuando cambia provincia
    
    // Notificar cambio
    notifyChange(provincia, '', distrito, direccion);
  };

  // Manejar cambio de cantón
  const handleCantonChange = (canton: string) => {
    setSelectedCanton(canton);
    
    // Buscar el ID de ubicación
    const location = locations.find(
      loc => loc.provincia === selectedProvincia && loc.canton === canton
    );
    
    // Notificar cambio
    notifyChange(selectedProvincia, canton, distrito, direccion, location?.id.toString());
  };

  // Manejar cambio de distrito
  const handleDistritoChange = (newDistrito: string) => {
    setDistrito(newDistrito);
    notifyChange(selectedProvincia, selectedCanton, newDistrito, direccion);
  };

  // Manejar cambio de dirección
  const handleDireccionChange = (newDireccion: string) => {
    setDireccion(newDireccion);
    notifyChange(selectedProvincia, selectedCanton, distrito, newDireccion);
  };

  // Función auxiliar para notificar cambios
  const notifyChange = (
    prov: string,
    cant: string,
    dist: string,
    dir: string,
    locId?: string
  ) => {
    // Notificar inmediatamente cuando hay provincia (filtrado progresivo)
    // Si no hay provincia, notificar con valores vacíos para limpiar filtros
    const location = (prov && cant) ? (
      locId || locations.find(
        loc => loc.provincia === prov && loc.canton === cant
      )?.id.toString() || ''
    ) : '';
    
    onLocationSelect({
      locationId: location,
      provincia: prov,
      canton: cant,
      distrito: dist,
      direccion: dir
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Cargando ubicaciones...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Provincia */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="h-4 w-4 inline mr-1" />
          Provincia *
        </label>
        <div className="relative">
          <select
            value={selectedProvincia}
            onChange={(e) => handleProvinciaChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10 transition-colors"
            required
          >
            <option value="">Selecciona una provincia</option>
            {provincias.map((provincia) => (
              <option key={provincia} value={provincia}>
                {provincia}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Cantón */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cantón *
        </label>
        <div className="relative">
          <select
            value={selectedCanton}
            onChange={(e) => handleCantonChange(e.target.value)}
            disabled={!selectedProvincia || cantones.length === 0}
            className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10 transition-colors ${
              !selectedProvincia || cantones.length === 0
                ? 'bg-gray-100 cursor-not-allowed opacity-60'
                : ''
            }`}
            required
          >
            <option value="">
              {!selectedProvincia
                ? 'Primero selecciona una provincia'
                : 'Selecciona un cantón'}
            </option>
            {cantones.map((canton) => (
              <option key={canton} value={canton}>
                {canton}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
        {selectedProvincia && cantones.length === 0 && (
          <p className="mt-1 text-sm text-gray-500">
            No hay cantones disponibles para esta provincia
          </p>
        )}
      </div>

      {/* Distrito (opcional, texto libre) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Distrito / Parroquia (opcional)
        </label>
        <input
          type="text"
          value={distrito}
          onChange={(e) => handleDistritoChange(e.target.value)}
          placeholder="Ej: Centro, Norte, Sur..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Dirección específica (opcional, texto libre) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dirección Específica (opcional)
        </label>
        <input
          type="text"
          value={direccion}
          onChange={(e) => handleDireccionChange(e.target.value)}
          placeholder="Ej: Av. Principal y Calle Secundaria"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        <p className="mt-1 text-xs text-gray-500">
          Puedes incluir calles, referencias, número de casa, etc.
        </p>
      </div>

      {/* Resumen de ubicación seleccionada */}
      {selectedProvincia && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            📍 {selectedCanton ? 'Ubicación seleccionada' : 'Filtrando por provincia'}:
          </p>
          <p className="text-sm text-blue-700 mt-1">
            {selectedProvincia}
            {selectedCanton && ` → ${selectedCanton}`}
            {distrito && ` → ${distrito}`}
            {direccion && ` (${direccion})`}
          </p>
        </div>
      )}
    </div>
  );
};

export default HierarchicalLocationSearch;

