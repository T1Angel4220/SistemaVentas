const { Pool } = require('pg');
require('dotenv').config();

// Configurar conexión a la base de datos
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sistema_ventas',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

// Coordenadas aproximadas de las principales ciudades de Ecuador por provincia
const coordenadasEcuador = {
  'Pichincha': { lat: -0.1807, lng: -78.4678, ciudad: 'Quito' },
  'Guayas': { lat: -2.1710, lng: -79.9224, ciudad: 'Guayaquil' },
  'Azuay': { lat: -2.9001, lng: -79.0059, ciudad: 'Cuenca' },
  'Tungurahua': { lat: -1.2417, lng: -78.6197, ciudad: 'Ambato' },
  'Loja': { lat: -4.0071, lng: -79.2050, ciudad: 'Loja' },
  'El Oro': { lat: -3.2586, lng: -79.9544, ciudad: 'Machala' },
  'Manabí': { lat: -1.0544, lng: -80.4545, ciudad: 'Portoviejo' },
  'Los Ríos': { lat: -1.8019, lng: -79.5344, ciudad: 'Babahoyo' },
  'Imbabura': { lat: 0.3485, lng: -78.1264, ciudad: 'Ibarra' },
  'Cotopaxi': { lat: -0.9318, lng: -78.6156, ciudad: 'Latacunga' },
  'Chimborazo': { lat: -1.6631, lng: -78.6471, ciudad: 'Riobamba' },
  'Cañar': { lat: -2.7386, lng: -78.8386, ciudad: 'Azogues' },
  'Bolívar': { lat: -1.5906, lng: -79.0014, ciudad: 'Guaranda' },
  'Esmeraldas': { lat: 0.9655, lng: -79.6538, ciudad: 'Esmeraldas' },
  'Santa Elena': { lat: -2.2267, lng: -80.8581, ciudad: 'Santa Elena' },
  'Santo Domingo de los Tsáchilas': { lat: -0.2542, lng: -79.1719, ciudad: 'Santo Domingo' },
  'Sucumbíos': { lat: 0.0884, lng: -76.8953, ciudad: 'Nueva Loja' },
  'Napo': { lat: -0.9936, lng: -77.8145, ciudad: 'Tena' },
  'Orellana': { lat: -0.4657, lng: -76.9878, ciudad: 'Francisco de Orellana' },
  'Pastaza': { lat: -1.4667, lng: -77.9833, ciudad: 'Puyo' },
  'Morona Santiago': { lat: -2.3088, lng: -78.1200, ciudad: 'Macas' },
  'Zamora Chinchipe': { lat: -4.0669, lng: -78.9544, ciudad: 'Zamora' },
  'Carchi': { lat: 0.8090, lng: -77.7159, ciudad: 'Tulcán' },
  'Galápagos': { lat: -0.7467, lng: -90.3038, ciudad: 'Puerto Baquerizo Moreno' }
};

// Calles típicas ecuatorianas
const callesEcuador = [
  'Av. 10 de Agosto', 'Av. 9 de Octubre', 'Av. Amazonas', 'Av. 6 de Diciembre',
  'Calle Roca', 'Calle Sucre', 'Calle Bolívar', 'Calle García Moreno',
  'Calle Guayaquil', 'Calle Cuenca', 'Calle Quito', 'Calle Ambato',
  'Av. Simón Bolívar', 'Calle Primera', 'Calle Segunda', 'Calle 24 de Mayo',
  'Av. de los Shyris', 'Calle Venezuela', 'Calle Colón', 'Av. Universitaria',
  'Calle Principal', 'Av. del Ejército', 'Calle 5 de Junio', 'Calle 12 de Abril'
];

// Función para generar coordenadas válidas de Ecuador
function generarCoordenadasEcuador(provincia) {
  // Si tenemos coordenadas conocidas para la provincia, usarlas con variación
  if (coordenadasEcuador[provincia]) {
    const base = coordenadasEcuador[provincia];
    // Agregar variación aleatoria pequeña (±0.05 grados ≈ 5.5 km)
    const variacionLat = (Math.random() - 0.5) * 0.1;
    const variacionLng = (Math.random() - 0.5) * 0.1;
    return {
      lat: (base.lat + variacionLat).toFixed(6),
      lng: (base.lng + variacionLng).toFixed(6)
    };
  }
  
  // Si no conocemos la provincia, usar coordenadas generales de Ecuador
  // Latitud: -4.23 a 1.46, Longitud: -81.08 a -75.19
  const lat = (-4.23 + Math.random() * (1.46 - (-4.23))).toFixed(6);
  const lng = (-81.08 + Math.random() * (-75.19 - (-81.08))).toFixed(6);
  return { lat, lng };
}

// Función para generar dirección específica ecuatoriana
function generarDireccionEcuador(canton) {
  const calle = callesEcuador[Math.floor(Math.random() * callesEcuador.length)];
  const numero = Math.floor(Math.random() * 2000) + 1;
  const referencia = [
    'Frente al parque', 'Cerca del mercado', 'Diagonal a la escuela',
    'Junto al centro comercial', 'Cerca de la iglesia', 'Frente al banco',
    'Esquina principal', 'Cerca del hospital', 'Frente al estadio',
    'Junto a la universidad', 'Cerca de la terminal', 'Frente a la plaza'
  ][Math.floor(Math.random() * 12)];
  
  return `${calle} #${numero}, ${referencia}`;
}

// Productos de prueba variados
const productos = [
  {
    codigo: 'LAPTOP-001',
    nombre: 'Laptop HP Pavilion 15',
    descripcion: 'Laptop HP Pavilion 15 con procesador Intel Core i5 de 11va generación, 8GB RAM DDR4, disco duro SSD de 256GB, pantalla Full HD de 15.6 pulgadas. Ideal para trabajo y estudio. Incluye Windows 11 Home preinstalado.',
    precio: 599.99,
    tipo: 'producto',
    imagenes: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800'
    ]
  },
  {
    codigo: 'PHONE-001',
    nombre: 'Samsung Galaxy A54 5G',
    descripcion: 'Smartphone Samsung Galaxy A54 5G con pantalla Super AMOLED de 6.4", cámara triple de 50MP, 128GB de almacenamiento, 6GB RAM. Batería de 5000mAh con carga rápida. Color negro.',
    precio: 449.99,
    tipo: 'producto',
    imagenes: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800'
    ]
  },
  {
    codigo: 'SOFA-001',
    nombre: 'Sofá 3 Puestos Moderno',
    descripcion: 'Elegante sofá de 3 puestos tapizado en tela suave color gris, con estructura de madera resistente. Diseño moderno y cómodo, perfecto para sala de estar. Medidas: 2.10m x 0.85m x 0.90m.',
    precio: 389.50,
    tipo: 'producto',
    imagenes: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800'
    ]
  },
  {
    codigo: 'BIKE-001',
    nombre: 'Bicicleta de Montaña Trek 29"',
    descripcion: 'Bicicleta de montaña Trek Marlin 5 con ruedas de 29 pulgadas, marco de aluminio, 21 velocidades Shimano, frenos de disco mecánicos. Ideal para trails y aventuras off-road. Talla M.',
    precio: 520.00,
    tipo: 'producto',
    imagenes: [
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800',
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800'
    ]
  },
  {
    codigo: 'CAMERA-001',
    nombre: 'Cámara Canon EOS Rebel T7',
    descripcion: 'Cámara DSLR Canon EOS Rebel T7 con sensor de 24.1MP, lente 18-55mm incluido, grabación de video Full HD, WiFi integrado. Perfecta para principiantes y entusiastas de la fotografía.',
    precio: 479.00,
    tipo: 'producto',
    imagenes: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800',
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'
    ]
  },
  {
    codigo: 'WATCH-001',
    nombre: 'Apple Watch Series 8',
    descripcion: 'Apple Watch Series 8 de 45mm, caja de aluminio color medianoche, correa deportiva, GPS + Cellular. Monitor de frecuencia cardíaca, oxígeno en sangre, detección de caídas. Compatible con iPhone.',
    precio: 399.00,
    tipo: 'producto',
    imagenes: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800'
    ]
  },
  {
    codigo: 'DESK-001',
    nombre: 'Escritorio Gaming RGB',
    descripcion: 'Escritorio gaming con iluminación LED RGB personalizable, superficie de carbono, soporte para auriculares, porta cables, dimensiones 140cm x 70cm. Perfecto para setup de gaming profesional.',
    precio: 299.99,
    tipo: 'producto',
    imagenes: [
      'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800',
      'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800',
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800'
    ]
  },
  {
    codigo: 'CONSOLE-001',
    nombre: 'PlayStation 5 Digital Edition',
    descripcion: 'Consola PlayStation 5 Digital Edition, 825GB SSD, gráficos 4K, ray tracing, 120fps. Incluye control DualSense inalámbrico con retroalimentación háptica. Sin lector de discos.',
    precio: 449.99,
    tipo: 'producto',
    imagenes: [
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
      'https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=800',
      'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=800'
    ]
  },
  {
    codigo: 'HEADPHONES-001',
    nombre: 'Sony WH-1000XM5 Auriculares',
    descripcion: 'Auriculares inalámbricos Sony WH-1000XM5 con cancelación de ruido líder en la industria, sonido Hi-Res, batería de 30 horas, carga rápida, micrófono integrado. Color negro.',
    precio: 379.99,
    tipo: 'producto',
    imagenes: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
      'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800'
    ]
  },
  {
    codigo: 'TABLET-001',
    nombre: 'iPad Air 5ta Generación',
    descripcion: 'iPad Air 5ta gen con chip M1, pantalla Liquid Retina de 10.9", 64GB, WiFi, cámara frontal de 12MP con encuadre centrado. Compatible con Apple Pencil y Magic Keyboard. Color azul cielo.',
    precio: 599.00,
    tipo: 'producto',
    imagenes: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800',
      'https://images.unsplash.com/photo-1585790050230-5dd28404f905?w=800'
    ]
  },
  {
    codigo: 'SERV-CLEAN-001',
    nombre: 'Servicio de Limpieza Profunda',
    descripcion: 'Servicio profesional de limpieza profunda para hogares y oficinas. Incluye limpieza de ventanas, pisos, baños, cocina, muebles. Personal capacitado, productos de alta calidad. Disponible de lunes a sábado.',
    precio: 85.00,
    tipo: 'servicio',
    imagenes: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
      'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800',
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800'
    ]
  },
  {
    codigo: 'SERV-PLUMB-001',
    nombre: 'Servicio de Plomería 24/7',
    descripcion: 'Servicio de plomería de emergencia disponible 24/7. Reparación de fugas, instalación de tuberías, destape de cañerías, mantenimiento preventivo. Plomeros certificados con experiencia.',
    precio: 45.00,
    tipo: 'servicio',
    imagenes: [
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800'
    ]
  },
  {
    codigo: 'SERV-TUTOR-001',
    nombre: 'Clases Particulares de Matemáticas',
    descripcion: 'Clases particulares de matemáticas para estudiantes de secundaria y preparatoria. Profesor con maestría en educación matemática. Sesiones personalizadas de 1 hora. Modalidad presencial u online.',
    precio: 25.00,
    tipo: 'servicio',
    imagenes: [
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800',
      'https://images.unsplash.com/photo-1596496181848-3091d4878b24?w=800',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'
    ]
  },
  {
    codigo: 'PRINTER-001',
    nombre: 'Impresora Epson EcoTank L3250',
    descripcion: 'Impresora multifuncional Epson EcoTank L3250 con sistema de tanque de tinta, impresión a color, escaneo y copiado. WiFi integrado, impresión desde smartphone. Rendimiento de hasta 7,500 páginas.',
    precio: 299.00,
    tipo: 'producto',
    imagenes: [
      'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800',
      'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=800',
      'https://images.unsplash.com/photo-1564556658547-45e2c5f5a7e3?w=800'
    ]
  },
  {
    codigo: 'FRIDGE-001',
    nombre: 'Refrigerador Samsung French Door',
    descripcion: 'Refrigerador Samsung French Door de 28 pies cúbicos, acero inoxidable, tecnología Twin Cooling Plus, dispensador de agua y hielo, cajones FlexZone. Eficiencia energética A++.',
    precio: 1299.99,
    tipo: 'producto',
    imagenes: [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800',
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800',
      'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800'
    ]
  }
];

async function insertProducts() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando inserción de productos de prueba...\n');
    
    // Obtener vendedores disponibles
    const vendedoresResult = await client.query(
      "SELECT id, nombre, apellido FROM usuarios WHERE tipo_usuario = 'vendedor' AND estado = 'activo' LIMIT 5"
    );
    
    if (vendedoresResult.rows.length === 0) {
      console.log('❌ No hay vendedores activos. Por favor, crea al menos un vendedor primero.');
      return;
    }
    
    console.log(`✅ Encontrados ${vendedoresResult.rows.length} vendedores:`);
    vendedoresResult.rows.forEach(v => {
      console.log(`   - ${v.nombre} ${v.apellido} (ID: ${v.id})`);
    });
    console.log('');
    
    // Obtener categorías disponibles
    const categoriasResult = await client.query(
      'SELECT id, nombre FROM categorias WHERE activa = true ORDER BY RANDOM() LIMIT 10'
    );
    
    if (categoriasResult.rows.length === 0) {
      console.log('❌ No hay categorías activas. Por favor, crea categorías primero.');
      return;
    }
    
    // Obtener ubicaciones disponibles con nombre completo
    const ubicacionesResult = await client.query(
      'SELECT id, nombre, provincia, canton FROM ubicaciones ORDER BY RANDOM() LIMIT 10'
    );
    
    if (ubicacionesResult.rows.length === 0) {
      console.log('❌ No hay ubicaciones. Por favor, inserta ubicaciones primero.');
      return;
    }
    
    console.log('📦 Insertando productos...\n');
    
    let productosInsertados = 0;
    let imagenesInsertadas = 0;
    
    for (const producto of productos) {
      // Seleccionar vendedor aleatorio
      const vendedor = vendedoresResult.rows[Math.floor(Math.random() * vendedoresResult.rows.length)];
      
      // Seleccionar categoría aleatoria
      const categoria = categoriasResult.rows[Math.floor(Math.random() * categoriasResult.rows.length)];
      
      // Seleccionar ubicación aleatoria
      const ubicacion = ubicacionesResult.rows[Math.floor(Math.random() * ubicacionesResult.rows.length)];
      
      // Generar datos de ubicación completos de Ecuador
      const coordenadas = generarCoordenadasEcuador(ubicacion.provincia);
      const direccion = generarDireccionEcuador(ubicacion.canton);
      const distrito = ubicacion.nombre || ubicacion.canton;
      
      // Insertar producto con todos los campos de ubicación de Ecuador
      const itemResult = await client.query(
        `INSERT INTO items (
          codigo, nombre, descripcion, precio, ubicacion_id, 
          ubicacion_provincia, ubicacion_canton, ubicacion_distrito, ubicacion_direccion, coordenadas,
          tipo, estado, categoria_id, vendedor_id, disponibilidad
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id, nombre`,
        [
          producto.codigo,
          producto.nombre,
          producto.descripcion,
          producto.precio,
          ubicacion.id,
          ubicacion.provincia,
          ubicacion.canton,
          distrito,
          direccion,
          `${coordenadas.lat},${coordenadas.lng}`,
          producto.tipo,
          'activo', // Productos activos para prueba (equivalente a aprobado)
          categoria.id,
          vendedor.id,
          true
        ]
      );
      
      const itemId = itemResult.rows[0].id;
      const itemNombre = itemResult.rows[0].nombre;
      
      console.log(`✅ Producto insertado: ${itemNombre} (ID: ${itemId})`);
      console.log(`   Vendedor: ${vendedor.nombre} ${vendedor.apellido}`);
      console.log(`   Categoría: ${categoria.nombre}`);
      console.log(`   Ubicación: ${distrito}, ${ubicacion.canton}, ${ubicacion.provincia}`);
      console.log(`   Dirección: ${direccion}`);
      console.log(`   Coordenadas: ${coordenadas.lat}, ${coordenadas.lng}`);
      console.log(`   Precio: $${producto.precio}`);
      
      productosInsertados++;
      
      // Insertar imágenes
      for (let i = 0; i < producto.imagenes.length; i++) {
        await client.query(
          `INSERT INTO item_imagenes (
            item_id, url_imagen, orden, es_principal
          ) VALUES ($1, $2, $3, $4)`,
          [
            itemId,
            producto.imagenes[i],
            i + 1,
            i === 0 // Primera imagen es la principal
          ]
        );
        imagenesInsertadas++;
      }
      
      console.log(`   📸 ${producto.imagenes.length} imágenes insertadas\n`);
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 ¡INSERCIÓN COMPLETADA EXITOSAMENTE!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📦 Total productos insertados: ${productosInsertados}`);
    console.log(`📸 Total imágenes insertadas: ${imagenesInsertadas}`);
    console.log(`📊 Promedio de imágenes por producto: ${(imagenesInsertadas / productosInsertados).toFixed(1)}`);
    console.log('═══════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error insertando productos:', error.message);
    console.error('Detalles:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar el script
insertProducts().catch(console.error);

