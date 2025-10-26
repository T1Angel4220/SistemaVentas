/**
 * Utilidades para cálculos geográficos
 * Fórmula de Haversine para calcular distancia entre dos puntos
 */

/**
 * Calcula la distancia entre dos coordenadas usando la fórmula de Haversine
 * @param {number} lat1 - Latitud del punto 1
 * @param {number} lon1 - Longitud del punto 1
 * @param {number} lat2 - Latitud del punto 2
 * @param {number} lon2 - Longitud del punto 2
 * @returns {number} Distancia en kilómetros
 */
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distancia = R * c;
  
  return distancia;
}

/**
 * Convierte grados a radianes
 * @param {number} deg - Grados
 * @returns {number} Radianes
 */
function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Parsea una cadena de coordenadas en formato "lat,lng"
 * @param {string} coordenadas - String con formato "lat,lng"
 * @returns {{lat: number, lng: number} | null} Objeto con lat/lng o null si es inválido
 */
function parseCoordenadas(coordenadas) {
  if (!coordenadas || typeof coordenadas !== 'string') {
    return null;
  }
  
  const partes = coordenadas.split(',').map(c => c.trim());
  
  if (partes.length !== 2) {
    return null;
  }
  
  const lat = parseFloat(partes[0]);
  const lng = parseFloat(partes[1]);
  
  if (isNaN(lat) || isNaN(lng)) {
    return null;
  }
  
  // Validar rango de coordenadas
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }
  
  return { lat, lng };
}

/**
 * Filtra productos por proximidad a una ubicación
 * @param {Array} productos - Array de productos con coordenadas
 * @param {number} lat - Latitud del usuario
 * @param {number} lng - Longitud del usuario
 * @param {number} radioKm - Radio de búsqueda en kilómetros
 * @returns {Array} Productos filtrados con distancia calculada
 */
function filtrarPorProximidad(productos, lat, lng, radioKm) {
  console.log('\n🔍 Procesando productos para filtro de proximidad...');
  
  const productosConDistancia = productos
    .map((producto, index) => {
      // Parsear coordenadas del producto
      const coords = parseCoordenadas(producto.coordenadas);
      
      if (!coords) {
        console.log(`  ❌ Producto "${producto.nombre}": coordenadas inválidas o no existen (${producto.coordenadas})`);
        return { ...producto, distancia: null };
      }
      
      // Calcular distancia
      const distancia = calcularDistancia(lat, lng, coords.lat, coords.lng);
      
      console.log(`  ✓ Producto "${producto.nombre}": ${distancia.toFixed(2)} km`);
      console.log(`    Coords producto: (${coords.lat}, ${coords.lng})`);
      console.log(`    Coords usuario: (${lat}, ${lng})`);
      
      return {
        ...producto,
        distancia: parseFloat(distancia.toFixed(2)) // Redondear a 2 decimales
      };
    });
  
  const productosFiltrados = productosConDistancia
    .filter(producto => {
      const dentroDelRadio = producto.distancia !== null && producto.distancia <= radioKm;
      if (producto.distancia !== null && !dentroDelRadio) {
        console.log(`  🚫 Producto "${producto.nombre}" excluido: ${producto.distancia} km > ${radioKm} km`);
      }
      return dentroDelRadio;
    })
    .sort((a, b) => a.distancia - b.distancia); // Ordenar por distancia (más cercano primero)
  
  console.log(`\n📊 Resumen: ${productosFiltrados.length} de ${productos.length} productos dentro del radio\n`);
  
  return productosFiltrados;
}

module.exports = {
  calcularDistancia,
  parseCoordenadas,
  filtrarPorProximidad
};

