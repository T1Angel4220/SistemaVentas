// Configuración para Azure PostgreSQL
// Usa variables de entorno si están disponibles, sino usa configuración por defecto
const { Pool } = require('pg');

// Crear pool de conexión con configuración de Azure
const pool = new Pool({
  host: process.env.PGHOST || 'postgres-sistema-ventas.postgres.database.azure.com',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'sistema_ventas_multiempresa',
  user: process.env.PGUSER || 'azureuser',
  password: process.env.PGPASSWORD || 'Angel_4220',
  ssl: {
    require: true,
    rejectUnauthorized: false // Necesario para Azure PostgreSQL
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000, // Aumentado para Azure
  client_encoding: 'UTF8',
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

// Función query usando el pool
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    return res;
  } catch (error) {
    console.error('Error en query:', { text, error: error.message });
    throw error;
  }
};

// Hash de contraseña para todos los usuarios: Angel_4220
// Hash: $2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO
const PASSWORD_HASH = '$2a$12$VCFbfXPU6jiuBExwdTqf6ugcfpEEqhGMpxsor9nAZtI5.JwlZkNDO';

async function insertarDatosPrueba() {
  try {
    console.log('🚀 Iniciando inserción de datos de prueba para Ecuador...\n');

    // =====================================================
    // PASO 1: INSERTAR USUARIOS
    // =====================================================
    console.log('📝 Paso 1: Insertando usuarios...');
    
    const usuarios = [
      // Administrador
      {
        cedula: '1000000001',
        nombre: 'Admin',
        apellido: 'Sistema',
        correo: 'admin@sistemaventas.com',
        telefono: '0999999999',
        direccion: 'Quito, Pichincha, Ecuador',
        genero: 'masculino',
        tipo_usuario: 'administrador'
      },
      // Moderadores
      {
        cedula: '1000000002',
        nombre: 'María',
        apellido: 'González',
        correo: 'maria.moderador@sistemaventas.com',
        telefono: '0999999998',
        direccion: 'Guayaquil, Guayas, Ecuador',
        genero: 'femenino',
        tipo_usuario: 'moderador'
      },
      {
        cedula: '1000000003',
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        correo: 'carlos.moderador@sistemaventas.com',
        telefono: '0999999997',
        direccion: 'Cuenca, Azuay, Ecuador',
        genero: 'masculino',
        tipo_usuario: 'moderador'
      },
      {
        cedula: '1000000004',
        nombre: 'Javier',
        apellido: 'García',
        correo: 'javier.moderador@sistemaventas.com',
        telefono: '0999999996',
        direccion: 'Ambato, Tungurahua, Ecuador',
        genero: 'masculino',
        tipo_usuario: 'moderador'
      },
      // Vendedores
      {
        cedula: '1000000005',
        nombre: 'Ana',
        apellido: 'Martínez',
        correo: 'ana.vendedor@sistemaventas.com',
        telefono: '0999999995',
        direccion: 'Quito, Pichincha, Ecuador',
        genero: 'femenino',
        tipo_usuario: 'vendedor'
      },
      {
        cedula: '1000000006',
        nombre: 'Luis',
        apellido: 'Hernández',
        correo: 'luis.vendedor@sistemaventas.com',
        telefono: '0999999994',
        direccion: 'Guayaquil, Guayas, Ecuador',
        genero: 'masculino',
        tipo_usuario: 'vendedor'
      },
      {
        cedula: '1000000007',
        nombre: 'Carmen',
        apellido: 'López',
        correo: 'carmen.vendedor@sistemaventas.com',
        telefono: '0999999993',
        direccion: 'Cuenca, Azuay, Ecuador',
        genero: 'femenino',
        tipo_usuario: 'vendedor'
      },
      {
        cedula: '1000000008',
        nombre: 'Roberto',
        apellido: 'Sánchez',
        correo: 'roberto.vendedor@sistemaventas.com',
        telefono: '0999999992',
        direccion: 'Ambato, Tungurahua, Ecuador',
        genero: 'masculino',
        tipo_usuario: 'vendedor'
      },
      {
        cedula: '1000000009',
        nombre: 'Miguel',
        apellido: 'Lopez',
        correo: 'miguel.vendedor@sistemaventas.com',
        telefono: '0999999991',
        direccion: 'Riobamba, Chimborazo, Ecuador',
        genero: 'masculino',
        tipo_usuario: 'vendedor'
      },
      {
        cedula: '1000000010',
        nombre: 'Patricia',
        apellido: 'Morales',
        correo: 'patricia.vendedor@sistemaventas.com',
        telefono: '0999999990',
        direccion: 'Portoviejo, Manabí, Ecuador',
        genero: 'femenino',
        tipo_usuario: 'vendedor'
      },
      // Compradores
      {
        cedula: '1000000011',
        nombre: 'Sofia',
        apellido: 'Ramírez',
        correo: 'sofia.comprador@sistemaventas.com',
        telefono: '0999999989',
        direccion: 'Quito, Pichincha, Ecuador',
        genero: 'femenino',
        tipo_usuario: 'comprador'
      },
      {
        cedula: '1000000012',
        nombre: 'Diego',
        apellido: 'Castro',
        correo: 'diego.comprador@sistemaventas.com',
        telefono: '0999999988',
        direccion: 'Guayaquil, Guayas, Ecuador',
        genero: 'masculino',
        tipo_usuario: 'comprador'
      },
      {
        cedula: '1000000013',
        nombre: 'Valeria',
        apellido: 'Morales',
        correo: 'valeria.comprador@sistemaventas.com',
        telefono: '0999999987',
        direccion: 'Cuenca, Azuay, Ecuador',
        genero: 'femenino',
        tipo_usuario: 'comprador'
      },
      {
        cedula: '1000000014',
        nombre: 'Andrés',
        apellido: 'Vargas',
        correo: 'andres.comprador@sistemaventas.com',
        telefono: '0999999986',
        direccion: 'Ambato, Tungurahua, Ecuador',
        genero: 'masculino',
        tipo_usuario: 'comprador'
      },
      {
        cedula: '1000000015',
        nombre: 'Camila',
        apellido: 'Torres',
        correo: 'camila.comprador@sistemaventas.com',
        telefono: '0999999985',
        direccion: 'Riobamba, Chimborazo, Ecuador',
        genero: 'femenino',
        tipo_usuario: 'comprador'
      },
      {
        cedula: '1000000016',
        nombre: 'Sebastián',
        apellido: 'Jiménez',
        correo: 'sebastian.comprador@sistemaventas.com',
        telefono: '0999999984',
        direccion: 'Portoviejo, Manabí, Ecuador',
        genero: 'masculino',
        tipo_usuario: 'comprador'
      }
    ];

    let usuariosCreados = 0;
    let usuariosActualizados = 0;
    const userIds = {};

    for (const usuario of usuarios) {
      try {
        const existingUser = await query(
          'SELECT id FROM usuarios WHERE correo = $1 OR cedula = $2',
          [usuario.correo, usuario.cedula]
        );

        if (existingUser.rows.length > 0) {
          await query(
            `UPDATE usuarios SET 
              password_hash = $1, nombre = $2, apellido = $3, telefono = $4, 
              direccion = $5, genero = $6, tipo_usuario = $7, estado = $8, email_verificado = $9 
            WHERE correo = $10`,
            [
              PASSWORD_HASH, usuario.nombre, usuario.apellido, usuario.telefono,
              usuario.direccion, usuario.genero, usuario.tipo_usuario, 'activo', true,
              usuario.correo
            ]
          );
          userIds[usuario.correo] = existingUser.rows[0].id;
          usuariosActualizados++;
          console.log(`   ✓ Actualizado: ${usuario.correo} (${usuario.tipo_usuario})`);
        } else {
          const result = await query(
            `INSERT INTO usuarios (
              cedula, nombre, apellido, correo, telefono, direccion, genero, 
              password_hash, tipo_usuario, estado, email_verificado
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
            [
              usuario.cedula, usuario.nombre, usuario.apellido, usuario.correo,
              usuario.telefono, usuario.direccion, usuario.genero, PASSWORD_HASH,
              usuario.tipo_usuario, 'activo', true
            ]
          );
          userIds[usuario.correo] = result.rows[0].id;
          usuariosCreados++;
          console.log(`   ✓ Creado: ${usuario.correo} (${usuario.tipo_usuario})`);
        }
      } catch (error) {
        console.error(`   ✗ Error con ${usuario.correo}:`, error.message);
      }
    }

    console.log(`\n   ✅ Usuarios creados: ${usuariosCreados}`);
    console.log(`   🔄 Usuarios actualizados: ${usuariosActualizados}\n`);

    // =====================================================
    // PASO 2: OBTENER CATEGORÍAS Y UBICACIONES
    // =====================================================
    console.log('📋 Paso 2: Obteniendo categorías y ubicaciones...');

    // Obtener categorías
    const categorias = await query('SELECT id, nombre FROM categorias WHERE activa = true');
    const categoriaMap = {};
    categorias.rows.forEach(cat => {
      categoriaMap[cat.nombre.toLowerCase()] = cat.id;
    });

    // Función auxiliar para encontrar categoría
    const encontrarCategoria = (nombres) => {
      for (const nombre of nombres) {
        for (const [key, value] of Object.entries(categoriaMap)) {
          if (key.includes(nombre.toLowerCase())) {
            return value;
          }
        }
      }
      // Si no encuentra, usar la primera categoría disponible
      return categorias.rows[0]?.id || null;
    };

    // Obtener ubicaciones de Ecuador
    const ubicaciones = await query(
      'SELECT id, nombre, provincia, canton FROM ubicaciones WHERE activa = true'
    );

    // Función auxiliar para encontrar ubicación
    const encontrarUbicacion = (provincia, canton) => {
      const ubicacion = ubicaciones.rows.find(
        u => u.provincia === provincia && u.canton === canton
      );
      return ubicacion?.id || ubicaciones.rows[0]?.id || null;
    };

    // Función auxiliar para obtener coordenadas según ciudad
    const obtenerCoordenadas = (provincia, canton) => {
      // Coordenadas aproximadas de las principales ciudades de Ecuador
      const coordenadasMap = {
        'Quito': '-0.1807,-78.4678', // Quito, Pichincha
        'Guayaquil': '-2.1709,-79.9224', // Guayaquil, Guayas
        'Cuenca': '-2.9001,-79.0059', // Cuenca, Azuay
        'Ambato': '-1.2417,-78.6197', // Ambato, Tungurahua
        'Riobamba': '-1.6736,-78.6478', // Riobamba, Chimborazo
        'Portoviejo': '-1.0544,-80.4544' // Portoviejo, Manabí
      };
      
      return coordenadasMap[canton] || '-0.1807,-78.4678'; // Default: Quito
    };

    console.log(`   ✓ Categorías encontradas: ${categorias.rows.length}`);
    console.log(`   ✓ Ubicaciones encontradas: ${ubicaciones.rows.length}\n`);

    // =====================================================
    // PASO 3: INSERTAR PRODUCTOS
    // =====================================================
    console.log('📦 Paso 3: Insertando productos...');

    const productos = [
      {
        codigo: 'PROD-001',
        nombre: 'Celular tecno 18p',
        descripcion: 'Celular nuevo de paquete, funciona todo correcto. Incluye cargador original y funda protectora. Pantalla de 6.5 pulgadas, 128GB de almacenamiento.',
        precio: 158.00,
        provincia: 'Tungurahua',
        canton: 'Ambato',
        distrito: 'Ambato',
        direccion: 'Av. Cevallos y Olmedo',
        categoria: ['smartphones', 'electrónicos', 'teléfonos'],
        vendedor: 'miguel.vendedor@sistemaventas.com',
        estado: 'pendiente_revision',
        imagenes: 3
      },
      {
        codigo: 'PROD-002',
        nombre: 'Laptop HP Pavilion',
        descripcion: 'Laptop HP Pavilion 15.6 pulgadas, Intel Core i5, 8GB RAM, 512GB SSD. Excelente estado, poco uso. Incluye cargador original.',
        precio: 450.00,
        provincia: 'Pichincha',
        canton: 'Quito',
        distrito: 'Centro Histórico',
        direccion: 'Av. Amazonas y Naciones Unidas',
        categoria: ['computadoras', 'electrónicos'],
        vendedor: 'ana.vendedor@sistemaventas.com',
        estado: 'activo',
        imagenes: 2
      },
      {
        codigo: 'PROD-003',
        nombre: 'Tablet Samsung Galaxy Tab',
        descripcion: 'Tablet Samsung Galaxy Tab A8, 10.5 pulgadas, 64GB, WiFi. Perfecta para trabajo y entretenimiento. Incluye funda y stylus.',
        precio: 280.00,
        provincia: 'Guayas',
        canton: 'Guayaquil',
        distrito: 'Centro',
        direccion: 'Av. 9 de Octubre y Malecón',
        categoria: ['tablets', 'electrónicos'],
        vendedor: 'luis.vendedor@sistemaventas.com',
        estado: 'activo',
        imagenes: 1
      },
      {
        codigo: 'PROD-004',
        nombre: 'Sofá de 3 plazas',
        descripcion: 'Sofá moderno de 3 plazas, color gris, tela resistente. Excelente estado, solo 6 meses de uso. Perfecto para sala de estar.',
        precio: 320.00,
        provincia: 'Azuay',
        canton: 'Cuenca',
        distrito: 'Centro',
        direccion: 'Calle Larga y Gran Colombia',
        categoria: ['muebles', 'hogar'],
        vendedor: 'carmen.vendedor@sistemaventas.com',
        estado: 'activo',
        imagenes: 2
      },
      {
        codigo: 'PROD-005',
        nombre: 'Refrigeradora Samsung',
        descripcion: 'Refrigeradora Samsung 2 puertas, 300L, color plateado, tecnología No Frost. Excelente estado, 2 años de uso. Incluye garantía.',
        precio: 580.00,
        provincia: 'Tungurahua',
        canton: 'Ambato',
        distrito: 'Ficoa',
        direccion: 'Av. Cevallos y 12 de Noviembre',
        categoria: ['electrodomésticos', 'hogar'],
        vendedor: 'roberto.vendedor@sistemaventas.com',
        estado: 'activo',
        imagenes: 1
      },
      {
        codigo: 'PROD-006',
        nombre: 'Bicicleta de montaña',
        descripcion: 'Bicicleta de montaña Trek, 21 velocidades, suspensión delantera, frenos de disco. Perfecta para ciclismo de montaña. Incluye casco y candado.',
        precio: 420.00,
        provincia: 'Pichincha',
        canton: 'Quito',
        distrito: 'La Mariscal',
        direccion: 'Av. Amazonas y Colón',
        categoria: ['deportes', 'ciclismo'],
        vendedor: 'ana.vendedor@sistemaventas.com',
        estado: 'activo',
        imagenes: 2
      },
      {
        codigo: 'PROD-007',
        nombre: 'Zapatos deportivos Nike',
        descripcion: 'Zapatos deportivos Nike Air Max, talla 42, color blanco y negro. Nuevos, sin usar. Perfectos para correr o entrenar.',
        precio: 95.00,
        provincia: 'Guayas',
        canton: 'Guayaquil',
        distrito: 'Samborondón',
        direccion: 'Av. Samborondón y Vía a la Costa',
        categoria: ['calzado', 'deportes'],
        vendedor: 'luis.vendedor@sistemaventas.com',
        estado: 'activo',
        imagenes: 1
      },
      {
        codigo: 'PROD-008',
        nombre: 'Libro de Programación',
        descripcion: 'Clean Code: A Handbook of Agile Software Craftsmanship - Robert C. Martin. Libro en excelente estado, tapa dura, edición en español.',
        precio: 35.00,
        provincia: 'Azuay',
        canton: 'Cuenca',
        distrito: 'El Vecino',
        direccion: 'Calle Larga y Benigno Malo',
        categoria: ['libros', 'educación'],
        vendedor: 'carmen.vendedor@sistemaventas.com',
        estado: 'activo',
        imagenes: 1
      },
      {
        codigo: 'PROD-009',
        nombre: 'Cámara Canon EOS',
        descripcion: 'Cámara Canon EOS Rebel T7, 24.1 MP, con lente 18-55mm. Perfecta para fotografía amateur. Incluye tarjeta SD, bolso y manual.',
        precio: 650.00,
        provincia: 'Pichincha',
        canton: 'Quito',
        distrito: 'Cumbayá',
        direccion: 'Av. Simón Bolívar y Av. Interoceánica',
        categoria: ['fotografía', 'electrónicos'],
        vendedor: 'patricia.vendedor@sistemaventas.com',
        estado: 'activo',
        imagenes: 3
      },
      {
        codigo: 'PROD-010',
        nombre: 'Escritorio de oficina',
        descripcion: 'Escritorio de oficina moderno, madera de pino, 120cm x 60cm. Incluye cajonera y estante superior. Perfecto para home office.',
        precio: 180.00,
        provincia: 'Manabí',
        canton: 'Portoviejo',
        distrito: 'Portoviejo',
        direccion: 'Av. Circunvalación y Av. 5 de Junio',
        categoria: ['muebles', 'hogar'],
        vendedor: 'patricia.vendedor@sistemaventas.com',
        estado: 'activo',
        imagenes: 1
      }
    ];

    let productosCreados = 0;
    const productoIds = {};

    for (const producto of productos) {
      try {
        const categoriaId = encontrarCategoria(producto.categoria);
        const ubicacionId = encontrarUbicacion(producto.provincia, producto.canton);
        const vendedorId = userIds[producto.vendedor];

        if (!categoriaId || !ubicacionId || !vendedorId) {
          console.log(`   ⚠ Saltando ${producto.codigo}: datos faltantes`);
          continue;
        }

        // Verificar si el producto ya existe
        const existing = await query('SELECT id FROM items WHERE codigo = $1', [producto.codigo]);

        // Obtener coordenadas para el producto
        const coordenadas = obtenerCoordenadas(producto.provincia, producto.canton);

        let itemId;
        if (existing.rows.length > 0) {
          // Actualizar producto existente
          await query(
            `UPDATE items SET 
              nombre = $1, descripcion = $2, precio = $3, ubicacion_id = $4,
              categoria_id = $5, vendedor_id = $6, estado = $7, disponibilidad = $8,
              ubicacion_provincia = $9, ubicacion_canton = $10, ubicacion_distrito = $11,
              ubicacion_direccion = $12, coordenadas = $13, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE codigo = $14 RETURNING id`,
            [
              producto.nombre, producto.descripcion, producto.precio, ubicacionId,
              categoriaId, vendedorId, producto.estado, true,
              producto.provincia, producto.canton, producto.distrito, producto.direccion,
              coordenadas, producto.codigo
            ]
          );
          itemId = existing.rows[0].id;
        } else {
          // Crear nuevo producto
          const result = await query(
            `INSERT INTO items (
              codigo, nombre, descripcion, precio, ubicacion_id, tipo, categoria_id,
              vendedor_id, estado, disponibilidad, ubicacion_provincia, ubicacion_canton,
              ubicacion_distrito, ubicacion_direccion, coordenadas, fecha_publicacion
            ) VALUES ($1, $2, $3, $4, $5, 'producto', $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
            RETURNING id`,
            [
              producto.codigo, producto.nombre, producto.descripcion, producto.precio,
              ubicacionId, categoriaId, vendedorId, producto.estado, true,
              producto.provincia, producto.canton, producto.distrito, producto.direccion,
              coordenadas
            ]
          );
          itemId = result.rows[0].id;
        }

        productoIds[producto.codigo] = itemId;

        // Insertar imágenes usando URLs directas de Unsplash con IDs específicos
        await query('DELETE FROM item_imagenes WHERE item_id = $1', [itemId]);
        
        // Mapear productos a IDs de imágenes de Unsplash (imágenes reales y relevantes)
        const imagenesProductos = {
          'PROD-001': ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop'], // Celular
          'PROD-002': ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=600&fit=crop'], // Laptop
          'PROD-003': ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop'], // Tablet
          'PROD-004': ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'], // Sofá
          'PROD-005': ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&h=600&fit=crop'], // Refrigeradora
          'PROD-006': ['https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'], // Bicicleta de montaña
          'PROD-007': ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop'], // Zapatos deportivos
          'PROD-008': ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop'], // Libro
          'PROD-009': ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop'], // Cámara
          'PROD-010': ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop'] // Escritorio
        };
        
        const urlsImagenes = imagenesProductos[producto.codigo] || ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop'];
        
        // Usar las URLs disponibles o repetir la primera si hay más imágenes solicitadas
        for (let i = 1; i <= producto.imagenes; i++) {
          const imageUrl = urlsImagenes[i - 1] || urlsImagenes[0];
          
          await query(
            `INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal)
            VALUES ($1, $2, $3, $4)`,
            [itemId, imageUrl, i, i === 1]
          );
        }
        
        console.log(`   📸 ${producto.imagenes} imagen(es) agregada(s) para ${producto.codigo}`);

        productosCreados++;
        console.log(`   ✓ ${producto.codigo}: ${producto.nombre}`);
      } catch (error) {
        console.error(`   ✗ Error con ${producto.codigo}:`, error.message);
      }
    }

    console.log(`\n   ✅ Productos creados/actualizados: ${productosCreados}\n`);

    // =====================================================
    // PASO 4: INSERTAR SERVICIOS
    // =====================================================
    console.log('🔧 Paso 4: Insertando servicios...');

    const servicios = [
      {
        codigo: 'SERV-001',
        nombre: 'Servicio de limpieza',
        descripcion: 'Servicio de limpieza a domicilio. Personal altamente calificado, directo hasta donde te encuentres, disponibilidad inmediata. Incluye limpieza profunda, desinfección y organización.',
        precio: 60.00,
        provincia: 'Tungurahua',
        canton: 'Ambato',
        distrito: 'Ambato',
        direccion: 'Servicio a domicilio en toda la ciudad',
        categoria: ['servicios'],
        vendedor: 'miguel.vendedor@sistemaventas.com',
        estado: 'rechazado',
        horario: '7:00 AM - 6:00 PM',
        dias: 'Lunes,Martes,Miércoles,Jueves,Viernes,Sábado',
        duracion: '2'
      },
      {
        codigo: 'SERV-002',
        nombre: 'Clases de guitarra',
        descripcion: 'Clases particulares de guitarra acústica y eléctrica. Para todos los niveles, desde principiantes hasta avanzados. Incluye material didáctico y técnicas de interpretación.',
        precio: 25.00,
        provincia: 'Pichincha',
        canton: 'Quito',
        distrito: 'La Mariscal',
        direccion: 'Clases a domicilio o en estudio',
        categoria: ['servicios', 'educación'],
        vendedor: 'ana.vendedor@sistemaventas.com',
        estado: 'activo',
        horario: '9:00 AM - 8:00 PM',
        dias: 'Lunes,Martes,Miércoles,Jueves,Viernes,Sábado',
        duracion: '1'
      },
      {
        codigo: 'SERV-003',
        nombre: 'Reparación de computadoras',
        descripcion: 'Servicio técnico profesional para computadoras y laptops. Reparación de hardware, instalación de software, eliminación de virus, actualización de sistema. Garantía en todas las reparaciones.',
        precio: 40.00,
        provincia: 'Guayas',
        canton: 'Guayaquil',
        distrito: 'Centro',
        direccion: 'Servicio a domicilio o en taller',
        categoria: ['servicios técnicos', 'servicios'],
        vendedor: 'luis.vendedor@sistemaventas.com',
        estado: 'activo',
        horario: '8:00 AM - 7:00 PM',
        dias: 'Lunes,Martes,Miércoles,Jueves,Viernes,Sábado',
        duracion: '1'
      },
      {
        codigo: 'SERV-004',
        nombre: 'Clases de inglés',
        descripcion: 'Clases particulares de inglés conversacional. Profesor certificado, metodología práctica. Preparación para exámenes internacionales. Clases individuales o grupales.',
        precio: 30.00,
        provincia: 'Azuay',
        canton: 'Cuenca',
        distrito: 'Centro',
        direccion: 'Clases presenciales o virtuales',
        categoria: ['servicios', 'educación'],
        vendedor: 'carmen.vendedor@sistemaventas.com',
        estado: 'activo',
        horario: '2:00 PM - 8:00 PM',
        dias: 'Martes,Jueves,Sábado',
        duracion: '1'
      },
      {
        codigo: 'SERV-005',
        nombre: 'Diseño gráfico profesional',
        descripcion: 'Servicio de diseño gráfico para logos, flyers, tarjetas de presentación, redes sociales. Diseños modernos y creativos. Incluye revisiones ilimitadas hasta quedar satisfecho.',
        precio: 80.00,
        provincia: 'Pichincha',
        canton: 'Quito',
        distrito: 'La Carolina',
        direccion: 'Trabajo remoto o presencial',
        categoria: ['servicios de diseño', 'servicios'],
        vendedor: 'roberto.vendedor@sistemaventas.com',
        estado: 'activo',
        horario: '9:00 AM - 6:00 PM',
        dias: 'Lunes,Martes,Miércoles,Jueves,Viernes',
        duracion: '3'
      },
      {
        codigo: 'SERV-006',
        nombre: 'Fotografía de eventos',
        descripcion: 'Servicio profesional de fotografía para eventos: bodas, quinceañeras, cumpleaños, corporativos. Incluye edición profesional, álbum digital y entrega rápida.',
        precio: 150.00,
        provincia: 'Guayas',
        canton: 'Guayaquil',
        distrito: 'Urdesa',
        direccion: 'Cobertura en toda la ciudad',
        categoria: ['servicios de entretenimiento', 'servicios'],
        vendedor: 'patricia.vendedor@sistemaventas.com',
        estado: 'activo',
        horario: 'Flexible según el evento',
        dias: 'Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo',
        duracion: '4'
      }
    ];

    let serviciosCreados = 0;

    for (const servicio of servicios) {
      try {
        const categoriaId = encontrarCategoria(servicio.categoria);
        const ubicacionId = encontrarUbicacion(servicio.provincia, servicio.canton);
        const vendedorId = userIds[servicio.vendedor];

        if (!categoriaId || !ubicacionId || !vendedorId) {
          console.log(`   ⚠ Saltando ${servicio.codigo}: datos faltantes`);
          continue;
        }

        // Obtener coordenadas para el servicio
        const coordenadas = obtenerCoordenadas(servicio.provincia, servicio.canton);

        // Verificar si el servicio ya existe
        const existing = await query('SELECT id FROM items WHERE codigo = $1', [servicio.codigo]);

        let itemId;
        if (existing.rows.length > 0) {
          // Actualizar servicio existente
          const updateResult = await query(
            `UPDATE items SET 
              nombre = $1, descripcion = $2, precio = $3, ubicacion_id = $4,
              categoria_id = $5, vendedor_id = $6, estado = $7, disponibilidad = $8,
              ubicacion_provincia = $9, ubicacion_canton = $10, ubicacion_distrito = $11,
              ubicacion_direccion = $12, coordenadas = $13, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE codigo = $14 RETURNING id`,
            [
              servicio.nombre, servicio.descripcion, servicio.precio, ubicacionId,
              categoriaId, vendedorId, servicio.estado, true,
              servicio.provincia, servicio.canton, servicio.distrito, servicio.direccion,
              coordenadas, servicio.codigo
            ]
          );
          itemId = updateResult.rows[0]?.id || existing.rows[0].id;
        } else {
          // Crear nuevo servicio
          const result = await query(
            `INSERT INTO items (
              codigo, nombre, descripcion, precio, ubicacion_id, tipo, categoria_id,
              vendedor_id, estado, disponibilidad, ubicacion_provincia, ubicacion_canton,
              ubicacion_distrito, ubicacion_direccion, coordenadas, fecha_publicacion
            ) VALUES ($1, $2, $3, $4, $5, 'servicio', $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
            RETURNING id`,
            [
              servicio.codigo, servicio.nombre, servicio.descripcion, servicio.precio,
              ubicacionId, categoriaId, vendedorId, servicio.estado, true,
              servicio.provincia, servicio.canton, servicio.distrito, servicio.direccion,
              coordenadas
            ]
          );
          itemId = result.rows[0].id;
        }

        // Verificar si ya existe un servicio para este item_id
        const servicioExistente = await query(
          'SELECT id FROM servicios WHERE item_id = $1',
          [itemId]
        );

        if (servicioExistente.rows.length > 0) {
          // Actualizar servicio existente
          await query(
            `UPDATE servicios SET 
              horario_atencion = $1, 
              dias_disponibles = $2, 
              duracion_estimada = $3
            WHERE item_id = $4`,
            [servicio.horario, servicio.dias, servicio.duracion, itemId]
          );
        } else {
          // Insertar nuevo servicio
          await query(
            `INSERT INTO servicios (item_id, horario_atencion, dias_disponibles, duracion_estimada)
            VALUES ($1, $2, $3, $4)`,
            [itemId, servicio.horario, servicio.dias, servicio.duracion]
          );
        }

        // Insertar imágenes para el servicio usando URLs directas de Unsplash
        await query('DELETE FROM item_imagenes WHERE item_id = $1', [itemId]);
        
        // Mapear servicios a IDs de imágenes de Unsplash (imágenes reales y relevantes)
        const imagenesServicios = {
          'SERV-001': ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop'], // Limpieza
          'SERV-002': ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&h=600&fit=crop'], // Clases de guitarra
          'SERV-003': ['https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop'], // Reparación de computadoras
          'SERV-004': ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop'], // Clases de inglés
          'SERV-005': ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop'], // Diseño gráfico
          'SERV-006': ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop'] // Fotografía de eventos
        };
        
        const urlsImagenes = imagenesServicios[servicio.codigo] || ['https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop'];
        
        // Insertar 2 imágenes para servicios (una principal y una secundaria)
        for (let i = 1; i <= 2; i++) {
          const imageUrl = urlsImagenes[i - 1] || urlsImagenes[0];
          
          await query(
            `INSERT INTO item_imagenes (item_id, url_imagen, orden, es_principal)
            VALUES ($1, $2, $3, $4)`,
            [itemId, imageUrl, i, i === 1]
          );
        }

        serviciosCreados++;
        console.log(`   ✓ ${servicio.codigo}: ${servicio.nombre} (2 imágenes agregadas)`);
      } catch (error) {
        console.error(`   ✗ Error con ${servicio.codigo}:`, error.message);
      }
    }

    console.log(`\n   ✅ Servicios creados/actualizados: ${serviciosCreados}\n`);

    // =====================================================
    // RESUMEN FINAL
    // =====================================================
    console.log('========================================');
    console.log('📊 RESUMEN FINAL');
    console.log('========================================');

    const resumen = await query(`
      SELECT 
        'usuarios' as tipo, COUNT(*) as total FROM usuarios
      UNION ALL
      SELECT 'productos', COUNT(*) FROM items WHERE tipo = 'producto'
      UNION ALL
      SELECT 'servicios', COUNT(*) FROM items WHERE tipo = 'servicio'
      UNION ALL
      SELECT 'imágenes', COUNT(*) FROM item_imagenes
      UNION ALL
      SELECT 'servicios_detalle', COUNT(*) FROM servicios
    `);

    resumen.rows.forEach(row => {
      console.log(`   ${row.tipo}: ${row.total}`);
    });

    console.log('\n========================================');
    console.log('✅ INSERCIÓN COMPLETADA EXITOSAMENTE');
    console.log('========================================');
    console.log('🔑 Credenciales para todos los usuarios:');
    console.log('   Contraseña: Angel_4220');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    // Cerrar el pool de conexiones
    await pool.end();
  }
}

// Ejecutar script
if (require.main === module) {
  insertarDatosPrueba()
    .then(() => {
      console.log('🎉 Todos los datos de prueba están listos');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error no manejado:', error.message);
      console.error(error);
      process.exit(1);
    });
}

module.exports = { insertarDatosPrueba };

