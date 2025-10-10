/**
 * Servicio de detección de contenido inadecuado
 * Detecta automáticamente productos/servicios con contenido prohibido
 */

// Diccionario extenso de palabras prohibidas por categorías
const PALABRAS_PROHIBIDAS = {
  // Drogas y sustancias ilegales
  drogas: [
    'marihuana', 'cannabis', 'coca', 'cocaina', 'heroina', 'morfina', 'opio',
    'anfetamina', 'metanfetamina', 'lsd', 'mdma', 'ecstasy', 'ketamina',
    'dmt', 'psilocibina', 'hongos', 'ayahuasca', 'peyote', 'mescalina',
    'drogas', 'drogadiccion', 'trafico', 'narcotrafico', 'dealers',
    'crack', 'cristal', 'speed', 'tachas', 'pastillas', 'pildoras',
    'farmacos', 'medicamentos', 'prescripcion', 'receta', 'farmacia',
    'benzodiacepinas', 'xanax', 'valium', 'lorazepam', 'clonazepam',
    'opiáceos', 'fentanilo', 'tramadol', 'codeína', 'hidrocodona',
    'marihuana medicinal', 'cbd ilegal', 'thc', 'hash', 'hachis',
    'cocaína', 'perico', 'nieve', 'blanca', 'pasta', 'base',
    'heroína', 'chiva', 'china', 'blanca', 'morfina', 'opiáceo'
  ],

  // Armas y violencia
  armas: [
    'pistola', 'revolver', 'rifle', 'escopeta', 'fusil', 'metralleta',
    'subfusil', 'ametralladora', 'bazuca', 'granada', 'bomba', 'explosivo',
    'tnt', 'dinamita', 'nitroglicerina', 'detonador', 'fulminante',
    'arma', 'armas', 'armamento', 'municiones', 'balas', 'cartuchos',
    'proyectiles', 'explosivos', 'pirotecnia', 'cohetes', 'fuegos artificiales',
    'cuchillo', 'navaja', 'machete', 'espada', 'sable', 'katana',
    'hacha', 'mazo', 'garrote', 'porra', 'baston', 'palo',
    'gas pimienta', 'spray', 'taser', 'pistola electrica', 'paralizador',
    'armas blancas', 'armas de fuego', 'armas automaticas', 'armas semiautomaticas',
    'pistola de aire', 'rifle de aire', 'ballesta', 'arco', 'flechas',
    'tiro', 'tiroteo', 'disparo', 'disparar', 'matar', 'asesinar',
    'homicidio', 'asesinato', 'violencia', 'agresion', 'agredir'
  ],

  // Contenido sexual explícito
  sexual: [
    'pornografia', 'porno', 'xxx', 'sexo', 'sexual', 'erotico',
    'prostitución', 'prostituta', 'escort', 'masaje sexual', 'happy ending',
    'trabajo sexual', 'servicios sexuales', 'compañía', 'acompañante',
    'webcam', 'cam girl', 'cam boy', 'streaming sexual', 'chaturbate',
    'onlyfans', 'fansly', 'content creator', 'modelo webcam',
    'juguetes sexuales', 'vibrador', 'consolador', 'dildo', 'masturbador',
    'lubricante', 'condones', 'preservativos', 'lenceria', 'lingerie',
    'ropa interior', 'calzones', 'brasieres', 'sostenes', 'tanga',
    'fetichismo', 'bdsm', 'dominacion', 'sumision', 'esclavitud',
    'piercing genital', 'tatuajes genitales', 'modificaciones corporales'
  ],

  // Violencia y contenido peligroso
  violencia: [
    'violencia', 'violento', 'agresion', 'agredir', 'golpear', 'pegar',
    'maltrato', 'abuso', 'tortura', 'suicidio', 'suicidarse', 'matarse',
    'autolesion', 'cortarse', 'quemarse', 'envenenamiento', 'intoxicacion',
    'acoso', 'acoso sexual', 'acoso laboral', 'bullying', 'intimidacion',
    'amenaza', 'amenazar', 'chantaje', 'extorsion', 'secuestro',
    'rapto', 'trata de personas', 'trafico humano', 'esclavitud',
    'tortura', 'torturar', 'mutilacion', 'decapitacion', 'decapitar',
    'asesinato', 'asesinar', 'homicidio', 'homicida', 'asesino',
    'serial killer', 'asesino serial', 'terrorista', 'terrorismo'
  ],

  // Discriminación y odio
  discriminacion: [
    'racismo', 'racista', 'xenofobia', 'xenofobo', 'homofobia', 'homofobo',
    'transfobia', 'transfobo', 'misoginia', 'misogino', 'machismo', 'machista',
    'sexismo', 'sexista', 'antisemitismo', 'antisemita', 'nazismo', 'nazi',
    'fascismo', 'fascista', 'supremacista', 'supremacia', 'odio racial',
    'discriminacion', 'discriminar', 'segregacion', 'segregar', 'apartheid',
    'genocidio', 'limpieza etnica', 'purificacion racial', 'eugenesia',
    'nazi', 'hitler', 'holocausto', 'campos de concentracion', 'ss',
    'esvastica', 'esvástica', 'saludo nazi', 'sieg heil'
  ],

  // Contenido ilegal y fraudes
  ilegal: [
    'fraude', 'estafa', 'robo', 'hurto', 'ladron', 'ladrones',
    'falsificacion', 'falsificar', 'documentos falsos', 'identidad falsa',
    'dinero falso', 'billetes falsos', 'monedas falsas', 'tarjetas clonadas',
    'hackear', 'hacker', 'pirateria', 'pirata', 'crack', 'keygen',
    'software pirata', 'peliculas pirata', 'musica pirata', 'libros pirata',
    'evasion fiscal', 'lavado de dinero', 'blanqueo', 'paraíso fiscal',
    'contrabando', 'contrabandista', 'mercado negro', 'economia sumergida',
    'soborno', 'corrupcion', 'cohecho', 'prevaricacion', 'malversacion'
  ],

  // Productos médicos y farmacéuticos
  medicos: [
    'medicamentos', 'farmacos', 'prescripcion medica', 'receta medica',
    'antibioticos', 'analgesicos', 'antidepresivos', 'ansioliticos',
    'medicina', 'tratamiento medico', 'diagnostico', 'sintomas',
    'enfermedad', 'patologia', 'virus', 'bacteria', 'infeccion',
    'cirugia', 'operacion', 'intervencion quirurgica', 'implantes',
    'protesis', 'organos', 'transplante', 'donacion de organos',
    'sangre', 'donacion de sangre', 'plasma', 'medula osea',
    'vacunas', 'inmunizacion', 'tratamiento experimental', 'ensayos clinicos'
  ],

  // Productos peligrosos
  peligrosos: [
    'veneno', 'toxico', 'venenoso', 'peligroso', 'riesgoso',
    'quimicos', 'sustancias quimicas', 'acidos', 'alcalis',
    'radioactivo', 'radiacion', 'uranio', 'plutonio', 'cesio',
    'mercurio', 'plomo', 'arsenico', 'cianuro', 'amoníaco',
    'cloro', 'fluor', 'yodo', 'bromo', 'fosforo',
    'gas toxico', 'vapores toxicos', 'humos toxicos', 'emisiones',
    'residuos peligrosos', 'desechos toxicos', 'contaminacion',
    'polucion', 'emisiones toxicas', 'derrame quimico'
  ],

  // Servicios ilegales
  servicios_ilegales: [
    'servicios sexuales', 'prostitucion', 'escort', 'masaje con final feliz',
    'trabajo sexual', 'compañía', 'acompañante', 'dama de compañía',
    'servicios de hacking', 'hackear cuentas', 'robar datos', 'phishing',
    'servicios de espionaje', 'vigilancia ilegal', 'interceptacion',
    'servicios de extorsion', 'chantaje', 'amenazas', 'intimidacion',
    'servicios de contrabando', 'trafico de mercancias', 'mercado negro',
    'servicios de lavado de dinero', 'blanqueo de capitales', 'evasion fiscal'
  ]
};

// Palabras adicionales comunes y variaciones
const PALABRAS_ADICIONALES = [
  // Variaciones de drogas
  'mota', 'yerba', 'hierba', 'ganja', 'weed', 'pot', 'grass',
  'coke', 'blow', 'snow', 'white', 'powder', 'lines',
  'hero', 'smack', 'dope', 'junk', 'horse',
  
  // Variaciones de armas
  'gatillo', 'gatillo facil', 'arma corta', 'arma larga',
  'pistola de juguete', 'arma de juguete', 'réplica', 'falsa',
  'balística', 'tiro al blanco', 'caza', 'cazador',
  
  // Variaciones de violencia
  'pelea', 'pelear', 'golpe', 'golpes', 'golpear', 'golpeado',
  'herida', 'heridas', 'sangre', 'sangriento', 'sangrienta',
  'muerte', 'muerto', 'muerta', 'morir', 'morirse',
  
  // Variaciones de contenido sexual
  'adulto', 'adultos', '18+', 'mayor de edad', 'contenido adulto',
  'intimo', 'intimos', 'privado', 'privados', 'personal',
  'sensual', 'sensuales', 'provocativo', 'provocativos',
  
  // Variaciones de discriminación
  'blanco superior', 'raza superior', 'pureza racial',
  'inferior', 'superior', 'dominacion', 'dominación',
  'opresion', 'opresión', 'represion', 'represión'
];

// Función para normalizar texto (quitar acentos, convertir a minúsculas, etc.)
const normalizarTexto = (texto) => {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^\w\s]/g, ' ') // Quitar caracteres especiales
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();
};

// Función para detectar contenido inadecuado
const detectarContenidoInadecuado = (nombre, descripcion) => {
  if (!nombre && !descripcion) {
    return { esInadecuado: false, palabrasDetectadas: [], categoria: null };
  }

  // Combinar nombre y descripción
  const textoCompleto = `${nombre || ''} ${descripcion || ''}`;
  const textoNormalizado = normalizarTexto(textoCompleto);

  const palabrasDetectadas = [];
  const categoriasDetectadas = new Set();

  // Verificar cada categoría de palabras prohibidas
  for (const [categoria, palabras] of Object.entries(PALABRAS_PROHIBIDAS)) {
    for (const palabra of palabras) {
      const palabraNormalizada = normalizarTexto(palabra);
      
      // Buscar la palabra en el texto
      if (textoNormalizado.includes(palabraNormalizada)) {
        palabrasDetectadas.push(palabra);
        categoriasDetectadas.add(categoria);
      }
    }
  }

  // Determinar la categoría principal (la de mayor riesgo)
  const categoriasAltoRiesgo = ['drogas', 'armas', 'violencia', 'ilegal'];
  const categoriasMedioRiesgo = ['sexual', 'discriminacion', 'peligrosos'];
  
  let categoriaDetectada = null;
  if (Array.from(categoriasDetectadas).some(cat => categoriasAltoRiesgo.includes(cat))) {
    // Si hay alguna categoría de alto riesgo, usar la primera de alto riesgo encontrada
    categoriaDetectada = Array.from(categoriasDetectadas).find(cat => categoriasAltoRiesgo.includes(cat));
  } else if (Array.from(categoriasDetectadas).some(cat => categoriasMedioRiesgo.includes(cat))) {
    // Si hay alguna categoría de medio riesgo, usar la primera de medio riesgo encontrada
    categoriaDetectada = Array.from(categoriasDetectadas).find(cat => categoriasMedioRiesgo.includes(cat));
  } else if (categoriasDetectadas.size > 0) {
    // Usar la primera categoría encontrada
    categoriaDetectada = Array.from(categoriasDetectadas)[0];
  }

  // Verificar palabras adicionales
  for (const palabra of PALABRAS_ADICIONALES) {
    const palabraNormalizada = normalizarTexto(palabra);
    
    if (textoNormalizado.includes(palabraNormalizada)) {
      palabrasDetectadas.push(palabra);
      if (!categoriaDetectada) {
        categoriaDetectada = 'general';
      }
    }
  }

  // Verificar patrones sospechosos
  const patronesSospechosos = [
    /\b\d+\s*(mg|gramos|g|ml|litros|l)\b.*\b(medicina|medicamento|farmaco)\b/i,
    /\b(venta|compro|vendo)\b.*\b(arma|pistola|rifle)\b/i,
    /\b(servicio|servicios)\b.*\b(sexual|intimo|privado)\b/i,
    /\b(contacto|whatsapp|telefono)\b.*\b(disponible|ahora|ya)\b/i,
    /\b(precio|costo)\b.*\b(negociable|hablar|contactar)\b/i
  ];

  for (const patron of patronesSospechosos) {
    if (patron.test(textoCompleto)) {
      palabrasDetectadas.push('patrón_sospechoso');
      if (!categoriaDetectada) {
        categoriaDetectada = 'sospechoso';
      }
    }
  }

  const resultado = {
    esInadecuado: palabrasDetectadas.length > 0,
    palabrasDetectadas: [...new Set(palabrasDetectadas)], // Eliminar duplicados
    categoria: categoriaDetectada,
    nivelRiesgo: calcularNivelRiesgo(palabrasDetectadas, categoriaDetectada),
    categoriasDetectadas: Array.from(categoriasDetectadas) // Debug: todas las categorías
  };

  // Debug logs
  if (resultado.esInadecuado) {
    console.log('🔍 DETECCIÓN DE CONTENIDO:', {
      textoOriginal: textoCompleto,
      textoNormalizado: textoNormalizado,
      palabrasDetectadas: resultado.palabrasDetectadas,
      categoriasDetectadas: resultado.categoriasDetectadas,
      categoriaFinal: categoriaDetectada,
      nivelRiesgo: resultado.nivelRiesgo
    });
  }

  return resultado;
};

// Función para calcular el nivel de riesgo
const calcularNivelRiesgo = (palabrasDetectadas, categoria) => {
  const categoriasAltoRiesgo = ['drogas', 'armas', 'violencia', 'ilegal'];
  const categoriasMedioRiesgo = ['sexual', 'discriminacion', 'peligrosos'];
  
  if (categoriasAltoRiesgo.includes(categoria)) {
    return 'alto';
  } else if (categoriasMedioRiesgo.includes(categoria)) {
    return 'medio';
  } else {
    return 'bajo';
  }
};

// Función para obtener mensaje de rechazo
const obtenerMensajeRechazo = (categoria, palabrasDetectadas) => {
  const mensajes = {
    drogas: 'El contenido hace referencia a sustancias ilegales o drogas, lo cual está prohibido en nuestra plataforma.',
    armas: 'El contenido hace referencia a armas o elementos peligrosos, lo cual está prohibido en nuestra plataforma.',
    sexual: 'El contenido contiene material sexual explícito, lo cual está prohibido en nuestra plataforma.',
    violencia: 'El contenido promueve violencia o actividades peligrosas, lo cual está prohibido en nuestra plataforma.',
    discriminacion: 'El contenido contiene mensajes discriminatorios o de odio, lo cual está prohibido en nuestra plataforma.',
    ilegal: 'El contenido hace referencia a actividades ilegales, lo cual está prohibido en nuestra plataforma.',
    medicos: 'Los productos médicos requieren autorización especial. Contacte con soporte para más información.',
    peligrosos: 'El contenido hace referencia a productos peligrosos, lo cual está prohibido en nuestra plataforma.',
    servicios_ilegales: 'El contenido hace referencia a servicios ilegales, lo cual está prohibido en nuestra plataforma.',
    sospechoso: 'El contenido ha sido detectado como sospechoso y requiere revisión manual.',
    general: 'El contenido contiene elementos inapropiados según nuestras políticas.'
  };

  const mensajeBase = mensajes[categoria] || mensajes.general;
  const palabrasEncontradas = palabrasDetectadas.slice(0, 3).join(', ');
  
  return `${mensajeBase} Palabras detectadas: ${palabrasEncontradas}.`;
};

module.exports = {
  detectarContenidoInadecuado,
  obtenerMensajeRechazo,
  PALABRAS_PROHIBIDAS,
  PALABRAS_ADICIONALES
};
