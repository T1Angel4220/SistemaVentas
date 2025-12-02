# Plan de Pruebas E2E - Módulo de Moderación y Reportes

## Objetivo
Verificar el correcto funcionamiento del módulo de moderación y reportes del sistema, excluyendo la funcionalidad de apelar productos.

## Tecnologías
- Playwright
- TypeScript
- Page Object Model (POM)

## Alcance de las Pruebas
20 pruebas de sistema end-to-end que cubren:
- Creación de reportes de productos
- Visualización de reportes
- Gestión de reportes (moderadores)
- Moderación directa de productos
- Filtros y búsquedas

---

## Lista de Pruebas

### 1. Reportes de Productos (5 pruebas)

#### PR-001: Comprador puede reportar un producto
- **Objetivo**: Verificar que un usuario comprador puede crear un reporte sobre un producto
- **Precondiciones**: Usuario comprador autenticado, producto existente publicado por otro usuario
- **Pasos**:
  1. Iniciar sesión como comprador
  2. Navegar a la página de detalle de un producto
  3. Hacer clic en el botón "Reportar Producto"
  4. Seleccionar tipo de reporte
  5. Ingresar motivo (mínimo 20 caracteres)
  6. Ingresar información adicional (opcional)
  7. Enviar reporte
- **Resultado Esperado**: Mensaje de éxito, reporte creado exitosamente

#### PR-002: Vendedor puede reportar producto de otro vendedor
- **Objetivo**: Verificar que un vendedor puede reportar productos de otros vendedores
- **Precondiciones**: Usuario vendedor autenticado, producto existente de otro vendedor
- **Pasos**: Similar a PR-001 pero con usuario vendedor
- **Resultado Esperado**: Reporte creado exitosamente

#### PR-003: Usuario no puede reportar su propio producto
- **Objetivo**: Verificar la validación que impide reportar productos propios
- **Precondiciones**: Usuario comprador/vendedor autenticado, producto propio
- **Pasos**:
  1. Iniciar sesión como vendedor/comprador
  2. Navegar a la página de detalle de un producto propio
  3. Verificar que el botón de reportar no está visible o está deshabilitado
  4. O intentar reportar y verificar mensaje de error
- **Resultado Esperado**: Error al intentar reportar producto propio

#### PR-004: Validación de campos requeridos al crear reporte
- **Objetivo**: Verificar validaciones del formulario de reporte
- **Precondiciones**: Usuario autenticado, producto existente
- **Pasos**:
  1. Abrir modal de reporte
  2. Intentar enviar sin seleccionar tipo de reporte
  3. Intentar enviar con motivo menor a 20 caracteres
- **Resultado Esperado**: Mensajes de validación apropiados

#### PR-005: Usuario puede ver sus propios reportes
- **Objetivo**: Verificar que los usuarios pueden visualizar sus reportes enviados
- **Precondiciones**: Usuario con reportes creados anteriormente
- **Pasos**:
  1. Iniciar sesión como usuario que ha creado reportes
  2. Navegar a la sección "Mis Reportes" (si existe) o verificar en detalle de producto
  3. Verificar que se muestran los reportes del usuario
- **Resultado Esperado**: Lista de reportes del usuario visible

---

### 2. Gestión de Reportes - Moderadores (8 pruebas)

#### PR-006: Moderador puede ver reportes pendientes
- **Objetivo**: Verificar que moderadores pueden acceder a la lista de reportes pendientes
- **Precondiciones**: Usuario moderador autenticado, reportes pendientes en el sistema
- **Pasos**:
  1. Iniciar sesión como moderador
  2. Navegar a `/moderation/reports`
  3. Verificar que se muestra la lista de reportes pendientes
- **Resultado Esperado**: Lista de reportes pendientes visible con información completa

#### PR-007: Moderador puede filtrar reportes por tipo
- **Objetivo**: Verificar funcionalidad de filtrado por tipo de reporte
- **Precondiciones**: Moderador autenticado, reportes de diferentes tipos
- **Pasos**:
  1. Acceder a gestión de reportes
  2. Seleccionar un tipo de reporte del filtro
  3. Verificar que solo se muestran reportes del tipo seleccionado
- **Resultado Esperado**: Filtrado correcto por tipo de reporte

#### PR-008: Moderador puede filtrar reportes por estado
- **Objetivo**: Verificar filtrado por estado de reporte
- **Precondiciones**: Moderador autenticado, reportes con diferentes estados
- **Pasos**:
  1. Acceder a gestión de reportes
  2. Seleccionar un estado del filtro (pendiente, en_revision, resuelto)
  3. Verificar filtrado correcto
- **Resultado Esperado**: Solo reportes del estado seleccionado

#### PR-009: Moderador puede resolver reporte aprobándolo
- **Objetivo**: Verificar que moderador puede aprobar un reporte (reporte infundado)
- **Precondiciones**: Moderador autenticado, reporte pendiente
- **Pasos**:
  1. Acceder a gestión de reportes
  2. Seleccionar un reporte pendiente
  3. Hacer clic en "Aprobar" o acción equivalente
  4. Ingresar explicación de decisión
  5. Confirmar acción
- **Resultado Esperado**: Reporte marcado como resuelto, producto mantiene estado activo

#### PR-010: Moderador puede resolver reporte rechazándolo
- **Objetivo**: Verificar resolución de reporte rechazándolo
- **Precondiciones**: Moderador autenticado, reporte pendiente
- **Pasos**:
  1. Seleccionar reporte pendiente
  2. Hacer clic en "Rechazar"
  3. Ingresar explicación
  4. Confirmar
- **Resultado Esperado**: Reporte resuelto, producto en estado rechazado

#### PR-011: Moderador puede resolver reporte suspendiendo producto
- **Objetivo**: Verificar suspensión de producto desde reporte
- **Precondiciones**: Moderador autenticado, reporte pendiente
- **Pasos**:
  1. Seleccionar reporte pendiente
  2. Hacer clic en "Suspender"
  3. Ingresar motivo
  4. Confirmar
- **Resultado Esperado**: Producto suspendido, reporte resuelto

#### PR-012: Moderador puede resolver reporte eliminando producto (marcar peligroso)
- **Objetivo**: Verificar marcado como peligroso desde resolución de reporte
- **Precondiciones**: Moderador autenticado, reporte pendiente
- **Pasos**:
  1. Seleccionar reporte pendiente
  2. Hacer clic en "Eliminar" o "Marcar como Peligroso"
  3. Ingresar explicación
  4. Confirmar marcado como peligroso si aplica
  5. Confirmar acción
- **Resultado Esperado**: Producto marcado como peligroso, oculto, reporte resuelto

#### PR-013: Validación al resolver reporte sin explicación
- **Objetivo**: Verificar validación de campos requeridos al resolver reporte
- **Precondiciones**: Moderador autenticado, reporte pendiente
- **Pasos**:
  1. Seleccionar reporte pendiente
  2. Intentar resolver sin ingresar explicación
  3. Verificar mensaje de validación
- **Resultado Esperado**: Error de validación, acción no completada

---

### 3. Moderación Directa de Productos (7 pruebas)

#### PR-014: Moderador puede ver productos pendientes de moderación
- **Objetivo**: Verificar acceso a lista de productos pendientes
- **Precondiciones**: Moderador autenticado, productos pendientes
- **Pasos**:
  1. Iniciar sesión como moderador
  2. Navegar a `/products/moderation`
  3. Verificar lista de productos pendientes
- **Resultado Esperado**: Lista de productos con información completa

#### PR-015: Moderador puede aprobar producto directamente
- **Objetivo**: Verificar aprobación directa de producto
- **Precondiciones**: Moderador autenticado, producto pendiente
- **Pasos**:
  1. Acceder a moderación de productos
  2. Seleccionar producto pendiente
  3. Hacer clic en "Aprobar"
  4. Confirmar acción
- **Resultado Esperado**: Producto aprobado, estado activo, mensaje de éxito

#### PR-016: Moderador puede rechazar producto directamente
- **Objetivo**: Verificar rechazo directo de producto
- **Precondiciones**: Moderador autenticado, producto pendiente
- **Pasos**:
  1. Seleccionar producto pendiente
  2. Hacer clic en "Rechazar"
  3. Ingresar motivo de rechazo
  4. Confirmar
- **Resultado Esperado**: Producto rechazado, mensaje de éxito

#### PR-017: Moderador puede suspender producto directamente
- **Objetivo**: Verificar suspensión directa de producto
- **Precondiciones**: Moderador autenticado, producto activo
- **Pasos**:
  1. Seleccionar producto
  2. Hacer clic en "Suspender"
  3. Ingresar motivo
  4. Confirmar
- **Resultado Esperado**: Producto suspendido, mensaje de éxito

#### PR-018: Moderador puede marcar producto como peligroso
- **Objetivo**: Verificar marcado como peligroso
- **Precondiciones**: Moderador autenticado, producto
- **Pasos**:
  1. Seleccionar producto
  2. Hacer clic en "Marcar como Peligroso"
  3. Ingresar motivo
  4. Confirmar
- **Resultado Esperado**: Producto marcado como peligroso, oculto, mensaje de éxito

#### PR-019: Moderador puede filtrar productos por estado
- **Objetivo**: Verificar filtrado de productos por estado
- **Precondiciones**: Moderador autenticado, productos con diferentes estados
- **Pasos**:
  1. Acceder a moderación de productos
  2. Seleccionar estado del filtro
  3. Verificar resultados filtrados
- **Resultado Esperado**: Solo productos del estado seleccionado

#### PR-020: Moderador puede buscar productos por nombre
- **Objetivo**: Verificar búsqueda de productos por nombre
- **Precondiciones**: Moderador autenticado, productos existentes
- **Pasos**:
  1. Acceder a moderación de productos
  2. Ingresar nombre de producto en búsqueda
  3. Verificar resultados
- **Resultado Esperado**: Solo productos que coincidan con la búsqueda

---

## Estructura de Archivos

```
frontend/e2e/
├── flows/
│   └── moderation/
│       ├── report-product.spec.ts      (PR-001 a PR-005)
│       ├── manage-reports.spec.ts      (PR-006 a PR-013)
│       └── moderate-products.spec.ts   (PR-014 a PR-020)
├── pages/
│   ├── ReportsManagementPage.ts        (POM para gestión de reportes)
│   ├── ProductModerationPage.ts        (POM para moderación de productos)
│   └── ProductDetailPage.ts            (POM para detalle de producto)
└── PLAN_PRUEBAS_MODERACION_REPORTES.md (este archivo)
```

---

## Datos de Prueba Requeridos

Para ejecutar las pruebas se requiere:
- Usuarios de prueba: comprador, vendedor, moderador, administrador
- Productos de prueba con diferentes estados
- Reportes de prueba con diferentes tipos y estados
- Productos propios del vendedor para validar restricciones

## Notas
- Las pruebas de apelación están excluidas según requisitos
- Se asume que existe funcionalidad para ver "Mis Reportes" o se implementará según necesidad
- Las pruebas deben ser independientes y poder ejecutarse en cualquier orden
