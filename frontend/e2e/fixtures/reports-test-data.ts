/**
 * Datos de prueba para tests de reportes
 */

export const ReportTestData = {
  // Tipos de reporte válidos
  tiposReporte: {
    contenido_inapropiado: 'contenido_inapropiado',
    producto_prohibido: 'producto_prohibido',
    informacion_falsa: 'informacion_falsa',
    spam: 'spam',
    otro: 'otro'
  },

  // Motivos de reporte de prueba (mínimo 20 caracteres)
  motivos: {
    contenidoInapropiado: 'Este producto contiene imágenes ofensivas que violan las políticas de la plataforma',
    productoProhibido: 'Este producto está prohibido por contener sustancias ilegales según las normativas vigentes',
    informacionFalsa: 'La descripción del producto contiene información falsa y engañosa sobre sus características',
    spam: 'Este producto es una publicación repetitiva o spam que no aporta valor a la plataforma',
    otro: 'Este producto presenta múltiples problemas que requieren revisión inmediata por parte de un moderador',
    corto: 'Es ilegal', // Menos de 20 caracteres para pruebas de validación
    muyCorto: 'No' // Muy corto
  },

  // Información adicional de prueba
  informacionAdicional: {
    conEvidencia: 'La imagen principal muestra contenido inadecuado. URL de evidencia: https://example.com/evidencia.jpg',
    sinEvidencia: '' // Vacío
  },

  // Decisiones de moderación
  decisiones: {
    aprobar: 'El producto cumple con las políticas. El reporte es infundado. No se encontraron violaciones.',
    rechazar: 'El producto contiene información falsa y viola las políticas de la plataforma. Se rechaza el producto.',
    suspender: 'Producto suspendido temporalmente para revisión. Se requiere más información del vendedor para tomar una decisión final.',
    eliminar: 'Producto prohibido que puede causar daño a los usuarios. Contiene sustancias ilegales. Marcado como peligroso.',
    corto: 'OK' // Menos de 10 caracteres para pruebas de validación
  }
};

/**
 * Generar motivo de reporte con longitud específica
 */
export function generateReportMotivo(length: number = 20): string {
  const base = 'Este es un motivo de reporte de prueba para validar el sistema';
  if (length <= base.length) {
    return base.substring(0, length);
  }
  return base + ' '.repeat(length - base.length);
}

/**
 * Generar decisión de moderación con longitud específica
 */
export function generateDecision(length: number = 10): string {
  const base = 'Esta es una decisión de moderación de prueba';
  if (length <= base.length) {
    return base.substring(0, length);
  }
  return base + ' '.repeat(length - base.length);
}





