# Plan de Pruebas de Integración - Módulo de Productos/Servicios

> **Nota**: Este plan incluye **64 casos de prueba esenciales** que cubren las funcionalidades críticas del módulo. Se priorizaron los casos de seguridad, permisos y flujos principales, eliminando redundancias y casos muy específicos.

## 📋 Índice
1. [Objetivo](#objetivo)
2. [Alcance](#alcance)
3. [Tecnologías](#tecnologías)
4. [Estructura de Pruebas](#estructura-de-pruebas)
5. [Casos de Prueba Detallados](#casos-de-prueba-detallados)
6. [Datos de Prueba](#datos-de-prueba)
7. [Criterios de Aceptación](#criterios-de-aceptación)

---

## 🎯 Objetivo

Validar mediante pruebas de integración que el módulo de productos/servicios funciona correctamente, incluyendo:
- Operaciones CRUD completas
- Sistema de detección automática de contenido inadecuado
- Gestión de estados y moderación
- Sistema de apelaciones
- Sistema de reportes
- Productos guardados (favoritos)
- Filtros y búsquedas avanzadas

---

## 📦 Alcance

### Funcionalidades a Probar

1. **Gestión Básica de Productos/Servicios**
   - Crear producto/servicio
   - Modificar producto/servicio
   - Eliminar producto/servicio
   - Visualizar producto/servicio
   - Cambiar estado de visualización (disponibilidad)

2. **Visualización y Filtros**
   - Listar productos con filtros por categoría
   - Filtros de precio (mínimo/máximo)
   - Filtros de ubicación
   - Búsqueda por texto
   - Paginación

3. **Detección Automática de Contenido**
   - Detección de productos no permitidos
   - Ocultamiento automático durante revisión
   - Clasificación por nivel de riesgo (alto/medio/bajo)

4. **Sistema de Apelaciones**
   - Crear apelación para producto rechazado/suspendido
   - Ver apelaciones propias
   - Moderador resuelve apelación

5. **Productos Peligrosos**
   - No pueden ser eliminados por vendedor
   - Ocultos automáticamente de visualización pública
   - Visibles solo para moderadores
   - Bloqueo automático de cuenta si tiene 3+ productos peligrosos

6. **Sistema de Reportes**
   - Comprador reporta producto
   - Moderador reporta producto
   - Reporte no desactiva automáticamente
   - Moderador resuelve reporte

7. **Productos Guardados (Favoritos)**
   - Guardar producto (me interesa)
   - Retirar producto guardado
   - Listar productos guardados
   - Verificar estado de guardado

8. **Moderación**
   - Aprobar producto
   - Rechazar producto
   - Suspender producto
   - Marcar como peligroso
   - Listar productos pendientes de moderación

---

## 🛠️ Tecnologías

- **Framework de Testing**: Mocha
- **Librería de Aserciones**: Chai
- **Cliente HTTP para Testing**: Supertest
- **Base de Datos**: PostgreSQL (test)
- **Autenticación**: JWT

---

## 📁 Estructura de Pruebas

```
backend/test/
├── integration/
│   └── products/
│       ├── products-crud.test.js          # CRUD básico (CF-063 a CF-082)
│       ├── products-filters.test.js        # Filtros y búsqueda (CF-083 a CF-090)
│       ├── products-content-detection.test.js # Detección de contenido (CF-091 a CF-094)
│       ├── products-appeals.test.js        # Apelaciones (CF-095 a CF-100)
│       ├── products-dangerous.test.js     # Productos peligrosos (CF-101 a CF-106)
│       ├── products-reports.test.js        # Reportes (CF-107 a CF-111)
│       ├── products-saved.test.js          # Productos guardados (CF-112 a CF-115)
│       ├── products-moderation.test.js     # Moderación (CF-116 a CF-120)
│       └── products-services.test.js       # Servicios y casos edge (CF-121 a CF-126)
├── helpers/
│   ├── products.helpers.js                 # Helpers para productos
│   └── fixtures.js                         # Datos de prueba
└── setup.js
```

---

## 📝 Casos de Prueba Esenciales

### 1. CRUD de Productos/Servicios

#### 1.1 Crear Producto
- ✅ **CF-063**: Crear producto válido como vendedor
- ✅ **CF-064**: Crear servicio válido como vendedor
- ✅ **CF-065**: Intentar crear producto como comprador (debe fallar)
- ✅ **CF-066**: Intentar crear producto sin autenticación (debe fallar)
- ✅ **CF-067**: Intentar crear producto con datos inválidos (debe fallar)
- ✅ **CF-068**: Crear producto con contenido peligroso (marcado automáticamente)

#### 1.2 Obtener Producto
- ✅ **CF-069**: Obtener producto por ID (público)
- ✅ **CF-070**: Obtener servicio con información adicional
- ✅ **CF-071**: Intentar obtener producto inexistente (debe retornar 404)
- ✅ **CF-072**: Comprador NO puede ver producto peligroso

#### 1.3 Actualizar Producto
- ✅ **CF-073**: Actualizar producto propio como vendedor
- ✅ **CF-074**: Intentar actualizar producto de otro vendedor (debe fallar)
- ✅ **CF-075**: Intentar actualizar producto peligroso (debe fallar)
- ✅ **CF-076**: Actualizar producto y detectar contenido inadecuado

#### 1.4 Eliminar Producto
- ✅ **CF-077**: Eliminar producto propio como vendedor
- ✅ **CF-078**: Intentar eliminar producto de otro vendedor (debe fallar)
- ✅ **CF-079**: Intentar eliminar producto peligroso como vendedor (debe fallar)
- ✅ **CF-080**: Administrador puede eliminar producto peligroso

#### 1.5 Cambiar Disponibilidad
- ✅ **CF-081**: Cambiar disponibilidad de producto activo
- ✅ **CF-082**: Intentar cambiar disponibilidad de producto pendiente (debe fallar)

---

### 2. Visualización y Filtros

#### 2.1 Listar Productos
- ✅ **CF-083**: Listar productos públicos (sin autenticación)
- ✅ **CF-084**: Listar productos con paginación
- ✅ **CF-085**: Productos peligrosos NO aparecen en listado público
- ✅ **CF-086**: Vendedor puede ver sus productos (NO ve peligrosos)

#### 2.2 Filtros Básicos
- ✅ **CF-087**: Filtrar productos por categoría
- ✅ **CF-088**: Filtrar productos por rango de precio
- ✅ **CF-089**: Buscar productos por nombre/descripción
- ✅ **CF-090**: Filtrar productos por tipo (producto/servicio)

---

### 3. Detección Automática de Contenido

#### 3.1 Detección al Crear
- ✅ **CF-091**: Crear producto con contenido de alto riesgo (marcado como peligroso)
- ✅ **CF-092**: Crear producto con contenido de medio riesgo (pendiente_revision)
- ✅ **CF-093**: Verificar que producto peligroso tiene motivo_rechazo

#### 3.2 Detección al Actualizar
- ✅ **CF-094**: Actualizar producto y detectar contenido peligroso

---

### 4. Sistema de Apelaciones

#### 4.1 Crear Apelación
- ✅ **CF-095**: Vendedor crea apelación para producto rechazado
- ✅ **CF-096**: Intentar crear apelación para producto peligroso (debe fallar)
- ✅ **CF-097**: Intentar crear apelación sin ser propietario (debe fallar)
- ✅ **CF-098**: Verificar que producto cambia a estado "en_apelacion"

#### 4.2 Resolver Apelación
- ✅ **CF-099**: Moderador aprueba apelación (producto pasa a activo)
- ✅ **CF-100**: Moderador rechaza apelación (producto permanece rechazado)

---

### 5. Productos Peligrosos

#### 5.1 Restricciones
- ✅ **CF-101**: Producto peligroso NO aparece en listado público
- ✅ **CF-102**: Vendedor NO puede eliminar producto peligroso
- ✅ **CF-103**: Vendedor NO puede editar producto peligroso
- ✅ **CF-104**: Moderador puede ver productos peligrosos

#### 5.2 Bloqueo Automático
- ✅ **CF-105**: Vendedor con 3 productos peligrosos se bloquea automáticamente
- ✅ **CF-106**: Verificar que cuenta bloqueada tiene estado "suspendido"

---

### 6. Sistema de Reportes

#### 6.1 Crear Reporte
- ✅ **CF-107**: Comprador reporta producto
- ✅ **CF-108**: Comprador NO puede reportar su propio producto
- ✅ **CF-109**: Reporte NO desactiva producto automáticamente

#### 6.2 Resolver Reporte
- ✅ **CF-110**: Moderador aprueba reporte (producto OK)
- ✅ **CF-111**: Moderador marca producto como peligroso por reporte

---

### 7. Productos Guardados (Favoritos)

#### 7.1 Guardar/Retirar
- ✅ **CF-112**: Comprador guarda producto activo
- ✅ **CF-113**: Intentar guardar producto ya guardado (debe fallar)
- ✅ **CF-114**: Comprador retira producto guardado
- ✅ **CF-115**: Listar productos guardados del usuario

---

### 8. Moderación

#### 8.1 Moderar Producto
- ✅ **CF-116**: Moderador aprueba producto (pasa a activo)
- ✅ **CF-117**: Moderador rechaza producto (pasa a rechazado)
- ✅ **CF-118**: Moderador suspende producto
- ✅ **CF-119**: Moderador marca producto como peligroso
- ✅ **CF-120**: Comprador NO puede moderar (debe fallar)

---

### 9. Servicios Específicos

- ✅ **CF-121**: Crear servicio con información adicional (horario, días, duración)
- ✅ **CF-122**: Actualizar información de servicio

---

### 10. Casos Edge y Validaciones

- ✅ **CF-123**: Crear producto sin campos requeridos (debe fallar)
- ✅ **CF-124**: Crear producto con precio negativo (debe fallar)
- ✅ **CF-125**: Usuario suspendido NO puede crear productos
- ✅ **CF-126**: Producto en revisión NO puede ser editado por vendedor

---

## 🗂️ Datos de Prueba

### Usuarios de Prueba
- Comprador activo
- Vendedor activo
- Vendedor suspendido
- Moderador activo
- Administrador activo

### Productos de Prueba
- Producto normal (activo)
- Producto pendiente_revision
- Producto rechazado
- Producto suspendido
- Producto peligroso
- Servicio normal (activo)
- Servicio con contenido inadecuado

### Categorías de Prueba
- Categorías válidas de la base de datos
- Categoría inexistente (para pruebas negativas)

### Ubicaciones de Prueba
- Ubicaciones válidas (provincia, cantón)
- Coordenadas geográficas válidas

---

## ✅ Criterios de Aceptación

### Funcionalidad
- ✅ Todas las operaciones CRUD funcionan correctamente
- ✅ Los filtros y búsquedas retornan resultados correctos
- ✅ La detección automática de contenido funciona
- ✅ El sistema de apelaciones funciona end-to-end
- ✅ El sistema de reportes funciona end-to-end
- ✅ Los productos peligrosos se manejan correctamente
- ✅ Los productos guardados funcionan correctamente
- ✅ La moderación funciona correctamente

### Seguridad
- ✅ Los permisos se validan correctamente
- ✅ Los usuarios no pueden acceder a recursos no autorizados
- ✅ La autenticación es requerida donde corresponde

### Rendimiento
- ✅ Las consultas con filtros son eficientes
- ✅ La paginación funciona correctamente
- ✅ No hay consultas N+1

### Calidad
- ✅ Cobertura de código > 70% (casos esenciales)
- ✅ Todos los casos de prueba pasan
- ✅ No hay errores en la consola durante las pruebas
- ✅ Casos críticos de seguridad y permisos validados

---

## 📊 Métricas de Éxito

- **Cobertura de Pruebas**: > 70%
- **Casos de Prueba Totales**: 64 casos esenciales (CF-063 a CF-126)
- **Tiempo de Ejecución**: < 3 minutos
- **Tasa de Éxito**: 100%

---

## 🔄 Orden de Ejecución Recomendado

1. **Setup y Teardown**: Limpiar base de datos antes y después
2. **CRUD Básico**: Establecer productos base para otras pruebas
3. **Detección de Contenido**: Validar que productos peligrosos se crean correctamente
4. **Filtros y Búsqueda**: Validar visualización
5. **Moderación**: Validar cambios de estado
6. **Apelaciones**: Validar flujo completo
7. **Reportes**: Validar flujo completo
8. **Productos Guardados**: Validar funcionalidad
9. **Casos Edge**: Validar validaciones y restricciones

---

## 📝 Notas Adicionales

- Todas las pruebas deben ser independientes (no depender de otras)
- Usar transacciones o limpieza de BD entre pruebas
- Mockear servicios externos si es necesario
- Validar respuestas HTTP correctas (200, 201, 400, 401, 403, 404, 500)
- Validar estructura de respuestas JSON
- Validar mensajes de error descriptivos

---

**Fecha de Creación**: 2024
**Última Actualización**: 2024
**Versión**: 1.0.0

