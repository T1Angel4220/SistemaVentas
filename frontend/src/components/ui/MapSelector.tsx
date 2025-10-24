import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from './Button';

// Fix para los iconos de Leaflet en React
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  provincia?: string;
}

// Coordenadas aproximadas de las capitales provinciales de Ecuador
const ECUADOR_CENTERS: { [key: string]: { lat: number; lng: number } } = {
  // Costa
  'Esmeraldas': { lat: 0.9592, lng: -79.6519 },
  'Manabí': { lat: -1.0569, lng: -80.4537 }, // Portoviejo
  'Los Ríos': { lat: -1.8018, lng: -79.4531 }, // Babahoyo
  'Guayas': { lat: -2.1700, lng: -79.9224 }, // Guayaquil
  'Santa Elena': { lat: -2.2267, lng: -80.8590 },
  'El Oro': { lat: -3.2581, lng: -79.9553 }, // Machala
  'Santo Domingo de los Tsáchilas': { lat: -0.2504, lng: -79.1750 },
  
  // Sierra
  'Carchi': { lat: 0.8118, lng: -77.7172 }, // Tulcán
  'Imbabura': { lat: 0.3499, lng: -78.1263 }, // Ibarra
  'Pichincha': { lat: -0.2295, lng: -78.5243 }, // Quito
  'Cotopaxi': { lat: -0.9350, lng: -78.6156 }, // Latacunga
  'Tungurahua': { lat: -1.2490, lng: -78.6186 }, // Ambato
  'Bolívar': { lat: -1.5933, lng: -79.0036 }, // Guaranda
  'Chimborazo': { lat: -1.6650, lng: -78.6540 }, // Riobamba
  'Cañar': { lat: -2.5597, lng: -78.8396 }, // Azogues
  'Azuay': { lat: -2.9001, lng: -79.0050 }, // Cuenca
  'Loja': { lat: -3.9931, lng: -79.2042 },
  
  // Amazonía
  'Sucumbíos': { lat: 0.0898, lng: -76.8903 }, // Nueva Loja
  'Napo': { lat: -0.9901, lng: -77.8150 }, // Tena
  'Orellana': { lat: -0.4586, lng: -76.9917 }, // Francisco de Orellana
  'Pastaza': { lat: -1.4882, lng: -78.0035 }, // Puyo
  'Morona Santiago': { lat: -2.3088, lng: -78.1184 }, // Macas
  'Zamora Chinchipe': { lat: -4.0692, lng: -78.9510 }, // Zamora
  
  // Galápagos
  'Galápagos': { lat: -0.7436, lng: -90.3044 }, // Puerto Baquerizo Moreno
};

// Centro de Ecuador por defecto (Quito)
const ECUADOR_DEFAULT_CENTER = { lat: -1.8312, lng: -78.1834 };

const LocationMarker: React.FC<{
  position: [number, number] | null;
  setPosition: (position: [number, number]) => void;
}> = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

export const MapSelector: React.FC<MapSelectorProps> = ({
  onLocationSelect,
  initialLat,
  initialLng,
  provincia,
}) => {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  
  const [mapCenter, setMapCenter] = useState<[number, number]>(() => {
    // Si hay coordenadas iniciales, usar esas
    if (initialLat && initialLng) {
      return [initialLat, initialLng];
    }
    
    // Si hay provincia, centrar en esa provincia
    if (provincia && ECUADOR_CENTERS[provincia]) {
      return [ECUADOR_CENTERS[provincia].lat, ECUADOR_CENTERS[provincia].lng];
    }
    
    // Por defecto, centrar en Ecuador
    return [ECUADOR_DEFAULT_CENTER.lat, ECUADOR_DEFAULT_CENTER.lng];
  });
  
  const [mapKey, setMapKey] = useState(0);

  // Actualizar el centro del mapa cuando cambie la provincia
  useEffect(() => {
    if (provincia && ECUADOR_CENTERS[provincia]) {
      setMapCenter([ECUADOR_CENTERS[provincia].lat, ECUADOR_CENTERS[provincia].lng]);
      setMapKey(prev => prev + 1); // Forzar recreación del mapa
    }
  }, [provincia]);

  // Notificar cambios de posición
  useEffect(() => {
    if (position) {
      onLocationSelect(position[0], position[1]);
    }
  }, [position, onLocationSelect]);

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          setMapCenter(newPos);
          setMapKey(prev => prev + 1);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          alert('No se pudo obtener tu ubicación actual. Por favor, haz clic en el mapa para seleccionar una ubicación.');
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  };

  const handleCenterOnProvince = () => {
    if (provincia && ECUADOR_CENTERS[provincia]) {
      const center = ECUADOR_CENTERS[provincia];
      setMapCenter([center.lat, center.lng]);
      setMapKey(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-3">
      {/* Información y botones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start space-x-2">
          <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 text-sm">
              📍 Selecciona la ubicación exacta
            </h4>
            <p className="text-xs text-blue-700 mt-1">
              Haz clic en el mapa donde se encuentra tu producto/servicio. 
              Puedes usar el botón de ubicación actual o centrar en tu provincia.
            </p>
          </div>
        </div>

        {/* Coordenadas seleccionadas */}
        {position && (
          <div className="bg-white border border-blue-200 rounded-md p-2">
            <p className="text-xs font-medium text-gray-700">
              📌 Coordenadas seleccionadas:
            </p>
            <p className="text-xs text-gray-600 font-mono mt-1">
              Latitud: {position[0].toFixed(6)} | Longitud: {position[1].toFixed(6)}
            </p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleUseCurrentLocation}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Navigation className="h-3 w-3 mr-1" />
            Usar mi ubicación actual
          </Button>
          
          {provincia && ECUADOR_CENTERS[provincia] && (
            <Button
              type="button"
              onClick={handleCenterOnProvince}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <MapPin className="h-3 w-3 mr-1" />
              Centrar en {provincia}
            </Button>
          )}
        </div>
      </div>

      {/* Mapa */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <MapContainer
          key={mapKey}
          center={mapCenter}
          zoom={provincia ? 10 : 7}
          style={{ height: '400px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      {/* Ayuda adicional */}
      <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-md p-2">
        <strong>💡 Consejo:</strong> Usa el zoom del mapa (rueda del mouse o botones +/-) para encontrar la ubicación exacta de tu producto.
      </div>
    </div>
  );
};

export default MapSelector;

