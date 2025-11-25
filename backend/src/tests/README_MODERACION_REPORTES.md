# Pruebas de Integración - Módulo de Moderación y Reportes

Este archivo contiene las pruebas de integración para el módulo de moderación y reportes del sistema.

## Descripción

Las pruebas implementan los 12 casos de prueba definidos en `PRUEBAS_INTEGRACION_MODERACION_REPORTES.md`:

- **CP-001**: Crear Reporte (Comprador)
- **CP-002**: Crear Reporte (Moderador)
- **CP-003**: Validación Reporte Propio
- **CP-004**: Validación Reporte Duplicado
- **CP-005**: Listar Reportes Pendientes
- **CP-006**: Resolver Reporte - Aprobar
- **CP-007**: Resolver Reporte - Rechazar
- **CP-008**: Resolver Reporte - Suspender
- **CP-009**: Resolver Reporte - Marcar Peligroso
- **CP-010**: Crear Apelación
- **CP-011**: Resolver Apelación - Aprobar
- **CP-012**: Resolver Apelación - Rechazar

## Requisitos Previos

1. Base de datos PostgreSQL configurada y accesible
2. Variables de entorno configuradas en `.env`:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `JWT_REFRESH_EXPIRES_IN`

3. La base de datos debe tener:
   - Tablas creadas (usuarios, items, reportes, apelaciones, categorias)
   - Al menos una categoría existente

## Ejecución

### Ejecutar todas las pruebas

```bash
npm run test:moderation
```

O directamente:

```bash
node src/tests/moderation-reports-integration.test.js
```

### Ejecutar una prueba específica

Puedes importar y ejecutar pruebas individuales:

```javascript
const { testCP001, testCP002 } = require('./moderation-reports-integration.test.js');

// Ejecutar prueba específica
testCP001();
```

## Funcionamiento

Las pruebas:

1. **Limpian datos anteriores**: Eliminan datos de prueba previos
2. **Crean usuarios de prueba**: 
   - Comprador
   - Vendedor
   - Moderador
3. **Crean productos de prueba**:
   - Producto activo
   - Producto propio del comprador
   - Producto rechazado
   - Producto suspendido
4. **Ejecutan las 12 pruebas** en secuencia
5. **Verifican resultados** en la base de datos
6. **Limpian datos** al finalizar

## Datos de Prueba

Los datos de prueba se crean con prefijos `TEST_` para facilitar su identificación:

- Usuarios: `test_comprador@test.com`, `test_vendedor@test.com`, `test_moderador@test.com`
- Productos: `TEST_Producto Activo`, `TEST_Producto Rechazado`, etc.

**Nota**: Los datos de prueba se eliminan automáticamente al finalizar las pruebas.

## Resultados

Las pruebas muestran:

- ✅ Pruebas que pasaron
- ❌ Pruebas que fallaron
- 📊 Resumen con estadísticas
- Detalle de cada prueba

Ejemplo de salida:

```
🧪 PRUEBAS DE INTEGRACIÓN - MÓDULO DE MODERACIÓN Y REPORTES
============================================================

✅ CP-001: ✅ PASÓ
✅ CP-002: ✅ PASÓ
...

📊 RESUMEN DE PRUEBAS
============================================================
✅ Pasadas: 12
❌ Fallidas: 0
📈 Total: 12
📊 Porcentaje de éxito: 100.0%
```

## Notas Importantes

1. **Base de datos**: Las pruebas modifican la base de datos. Asegúrate de usar una base de datos de desarrollo o pruebas.

2. **Categorías**: Las pruebas requieren que exista al menos una categoría en la base de datos. Si no existe, las pruebas fallarán.

3. **Validaciones del controlador**: Algunas pruebas (CP-003, CP-004) verifican que ciertas operaciones no se permitan. Estas validaciones se realizan en el controlador, pero las pruebas verifican que no se creen registros en la base de datos.

4. **Tokens JWT**: Las pruebas generan tokens JWT para simular autenticación, pero no realizan peticiones HTTP reales. Para pruebas end-to-end completas, se recomienda usar herramientas como Supertest.

## Solución de Problemas

### Error: "No hay categorías en la base de datos"

Solución: Asegúrate de que exista al menos una categoría en la tabla `categorias`.

### Error: "No se pudo conectar a la base de datos"

Solución: Verifica que las variables de entorno estén configuradas correctamente y que la base de datos esté accesible.

### Error: "Foreign key constraint"

Solución: Asegúrate de que las tablas estén creadas en el orden correcto y que existan las relaciones necesarias.

## Próximos Pasos

Para pruebas más completas, considera:

1. Usar Supertest para pruebas HTTP reales
2. Implementar mocks para servicios externos
3. Agregar pruebas de rendimiento
4. Implementar pruebas de carga
5. Agregar cobertura de código

