# PRUEBAS DEL SISTEMA - MÓDULO DE MODERACIÓN/REPORTES

## Descripción General
Este documento contiene 20 pruebas del sistema para el módulo de moderación y reportes del Sistema de Ventas Multiempresa. Las pruebas cubren funcionalidades, validaciones, permisos, integración y casos límite.

---

## PRUEBA 1: Crear Reporte Exitoso - Comprador
**Tipo:** Funcional | **Prioridad:** Alta  
**Objetivo:** Verificar que un comprador puede crear un reporte de producto exitosamente.

**Precondiciones:**
- Usuario comprador autenticado
- Producto activo existe en el sistema
- El producto no pertenece al usuario

**Pasos:**
1. Navegar a la página de detalle del producto
2. Hacer clic en el botón "Reportar Producto"
3. Seleccionar tipo de reporte: "Contenido Inapropiado"
4. Ingresar motivo del reporte con mínimo 20 caracteres: "Este producto contiene imágenes ofensivas que violan las políticas de la plataforma"
5. (Opcional) Agregar información adicional: "La imagen principal muestra contenido inadecuado"
6. Enviar el formulario

**Resultado Esperado:**
- El reporte se crea exitosamente
- Se muestra mensaje: "Reporte creado exitosamente. Será revisado por un moderador."
- El reporte queda en estado "pendiente"
- Se registra en la base de datos con los datos correctos

**Validaciones:**
- Status code: 201
- Campo `estado` = 'pendiente'
- Campo `tipo_reporte` = 'contenido_inapropiado'
- Campo `usuario_reportador_id` = ID del usuario actual
- Campo `item_id` = ID del producto reportado

---

## PRUEBA 2: Crear Reporte - Validación de Motivo Mínimo
**Tipo:** Validación | **Prioridad:** Alta  
**Objetivo:** Verificar que el sistema rechaza reportes con motivo menor a 20 caracteres.

**Precondiciones:**
- Usuario autenticado (comprador o moderador)
- Producto existe en el sistema

**Pasos:**
1. Abrir formulario de reporte
2. Seleccionar tipo de reporte: "Producto Prohibido"
3. Ingresar motivo con menos de 20 caracteres: "Es ilegal"
4. Intentar enviar el formulario

**Resultado Esperado:**
- El sistema muestra error de validación
- Mensaje: "El motivo del reporte debe tener al menos 20 caracteres"
- Status code: 400
- El reporte NO se crea

**Validaciones:**
- No se inserta registro en la tabla `reportes`
- El formulario mantiene los datos ingresados

---

## PRUEBA 3: Crear Reporte - Tipo de Reporte Inválido
**Tipo:** Validación | **Prioridad:** Alta  
**Objetivo:** Verificar que el sistema rechaza tipos de reporte no válidos.

**Precondiciones:**
- Usuario autenticado
- Producto existe

**Pasos:**
1. Hacer petición POST a `/api/products/:id/report`
2. Enviar tipo de reporte inválido: `tipo_reporte: "tipo_invalido"`
3. Enviar motivo válido (mínimo 20 caracteres)

**Resultado Esperado:**
- Status code: 400
- Mensaje: "Tipo de reporte inválido. Debe ser uno de: contenido_inapropiado, producto_prohibido, informacion_falsa, spam, otro"
- El reporte NO se crea

**Validaciones:**
- Solo se aceptan estos tipos: contenido_inapropiado, producto_prohibido, informacion_falsa, spam, otro

---

## PRUEBA 4: Crear Reporte - Producto No Encontrado
**Tipo:** Validación | **Prioridad:** Media  
**Objetivo:** Verificar manejo de error cuando el producto no existe.

**Precondiciones:**
- Usuario autenticado
- ID de producto inexistente

**Pasos:**
1. Intentar crear reporte para producto con ID inexistente (ej: 99999)
2. Enviar datos válidos de reporte

**Resultado Esperado:**
- Status code: 404
- Mensaje: "Producto no encontrado"
- No se crea el reporte

---

## PRUEBA 5: Crear Reporte - Auto-Reporte (Comprador)
**Tipo:** Validación | **Prioridad:** Alta  
**Objetivo:** Verificar que un comprador no puede reportar su propio producto.

**Precondiciones:**
- Usuario comprador autenticado
- Producto pertenece al mismo usuario

**Pasos:**
1. Como comprador, navegar a producto propio
2. Intentar crear reporte del producto

**Resultado Esperado:**
- Status code: 400
- Mensaje: "No puedes reportar tu propio producto"
- El reporte NO se crea

**Nota:** Los moderadores y administradores SÍ pueden reportar productos propios.

---

## PRUEBA 6: Crear Reporte - Reporte Duplicado
**Tipo:** Validación | **Prioridad:** Alta  
**Objetivo:** Verificar que un usuario no puede reportar el mismo producto dos veces.

**Precondiciones:**
- Usuario autenticado
- Ya existe un reporte del usuario para el mismo producto

**Pasos:**
1. Crear primer reporte del producto (exitoso)
2. Intentar crear segundo reporte del mismo producto
3. Enviar datos válidos

**Resultado Esperado:**
- Status code: 400
- Mensaje: "Ya has reportado este producto anteriormente"
- No se crea segundo reporte

**Validaciones:**
- Verificar en BD que existe solo un reporte del usuario para ese producto

---

## PRUEBA 7: Crear Reporte - Moderador Reporta Producto
**Tipo:** Funcional | **Prioridad:** Media  
**Objetivo:** Verificar que un moderador puede crear reportes con mensaje diferenciado.

**Precondiciones:**
- Usuario moderador autenticado
- Producto activo existe

**Pasos:**
1. Como moderador, crear reporte de producto
2. Enviar datos válidos

**Resultado Esperado:**
- Reporte creado exitosamente
- Status code: 201
- Mensaje: "Reporte creado exitosamente. Será revisado por otro moderador o administrador."
- El reporte queda en estado "pendiente"

**Diferencia con compradores:** El mensaje indica que será revisado por "otro moderador o administrador"

---

## PRUEBA 8: Ver Reportes Pendientes - Moderador
**Tipo:** Funcional | **Prioridad:** Alta  
**Objetivo:** Verificar que un moderador puede ver la lista de reportes pendientes.

**Precondiciones:**
- Usuario moderador o administrador autenticado
- Existen reportes pendientes en el sistema

**Pasos:**
1. Acceder a la página de gestión de reportes
2. Ver lista de reportes

**Resultado Esperado:**
- Se muestra la lista de reportes con estado "pendiente" o "en_revision"
- Cada reporte muestra:
  - Información del producto (nombre, código, precio, tipo)
  - Información del reportante
  - Tipo de reporte
  - Motivo del reporte
  - Fecha de reporte
  - Estado actual
- Status code: 200

**Validaciones:**
- Solo se muestran reportes con estado "pendiente" o "en_revision"
- Ordenados por fecha_reporte ASC (más antiguos primero)

---

## PRUEBA 9: Ver Reportes Pendientes - Sin Permisos
**Tipo:** Seguridad | **Prioridad:** Alta  
**Objetivo:** Verificar que usuarios sin permisos no pueden acceder a reportes pendientes.

**Precondiciones:**
- Usuario comprador o vendedor autenticado

**Pasos:**
1. Intentar acceder a GET `/api/reports/pending`

**Resultado Esperado:**
- Status code: 403
- Mensaje de acceso denegado
- No se muestran reportes

**Validaciones:**
- El middleware `requireProductModerate` bloquea el acceso

---

## PRUEBA 10: Filtrar Reportes por Tipo
**Tipo:** Funcional | **Prioridad:** Media  
**Objetivo:** Verificar que los filtros de tipo de reporte funcionan correctamente.

**Precondiciones:**
- Moderador autenticado
- Existen reportes de diferentes tipos

**Pasos:**
1. Acceder a gestión de reportes
2. Seleccionar filtro "Tipo de Reporte: Contenido Inapropiado"
3. Aplicar filtro

**Resultado Esperado:**
- Solo se muestran reportes de tipo "contenido_inapropiado"
- Los demás reportes se ocultan
- El contador se actualiza

**Validaciones:**
- Query parameter `tipo_reporte` se envía correctamente
- Backend filtra correctamente

---

## PRUEBA 11: Filtrar Reportes por Estado
**Tipo:** Funcional | **Prioridad:** Media  
**Objetivo:** Verificar que los filtros de estado funcionan correctamente.

**Precondiciones:**
- Moderador autenticado
- Existen reportes en diferentes estados

**Pasos:**
1. Acceder a gestión de reportes
2. Seleccionar filtro "Estado: Pendiente"
3. Aplicar filtro

**Resultado Esperado:**
- Solo se muestran reportes con estado "pendiente"
- Los demás reportes se ocultan

**Validaciones:**
- Query parameter `estado` se envía correctamente
- Combinación de filtros funciona (tipo + estado)

---

## PRUEBA 12: Resolver Reporte - Aprobar (Producto Válido)
**Tipo:** Funcional | **Prioridad:** Alta  
**Objetivo:** Verificar que un moderador puede aprobar un reporte rechazándolo (producto válido).

**Precondiciones:**
- Moderador autenticado
- Reporte en estado "pendiente" existe

**Pasos:**
1. Acceder a reporte pendiente
2. Hacer clic en "Producto Válido"
3. Ingresar explicación (mínimo 10 caracteres): "El producto cumple con las políticas. El reporte es infundado."
4. Confirmar acción

**Resultado Esperado:**
- Status code: 200
- El reporte cambia a estado "resuelto"
- El producto mantiene estado "activo"
- Se registra `moderador_resolutor_id`
- Se guarda `decision_final` y `fecha_resolucion`
- Mensaje: "Reporte procesado exitosamente. Producto: activo"

**Validaciones:**
- Estado del reporte: "resuelto"
- Estado del producto: "activo"
- Campo `decision_final` contiene la explicación

---

## PRUEBA 13: Resolver Reporte - Rechazar Producto
**Tipo:** Funcional | **Prioridad:** Alta  
**Objetivo:** Verificar que un moderador puede rechazar un producto reportado.

**Precondiciones:**
- Moderador autenticado
- Reporte pendiente existe
- Producto en estado "activo"

**Pasos:**
1. Seleccionar reporte
2. Hacer clic en "Rechazar Producto"
3. Ingresar explicación: "El producto contiene información falsa y viola las políticas de la plataforma."
4. Opcional: Marcar como peligroso
5. Confirmar

**Resultado Esperado:**
- Status code: 200
- Reporte estado: "resuelto"
- Producto estado: "rechazado"
- Se guarda motivo de rechazo

**Validaciones:**
- Estado producto: "rechazado"
- Campo `motivo_rechazo` actualizado en items

---

## PRUEBA 14: Resolver Reporte - Suspender Producto
**Tipo:** Funcional | **Prioridad:** Alta  
**Objetivo:** Verificar suspensión temporal de producto.

**Precondiciones:**
- Moderador autenticado
- Reporte pendiente existe

**Pasos:**
1. Seleccionar reporte
2. Hacer clic en "Suspender"
3. Ingresar explicación: "Producto suspendido temporalmente para revisión. Se requiere más información del vendedor."
4. Confirmar

**Resultado Esperado:**
- Status code: 200
- Reporte estado: "resuelto"
- Producto estado: "suspendido"
- Producto no visible en búsquedas

**Validaciones:**
- Estado producto: "suspendido"
- Producto oculto de catálogo público

---

## PRUEBA 15: Resolver Reporte - Marcar como Peligroso
**Tipo:** Funcional | **Prioridad:** Crítica  
**Objetivo:** Verificar que productos peligrosos se marcan correctamente y pueden bloquear cuenta.

**Precondiciones:**
- Moderador autenticado
- Reporte pendiente existe
- Vendedor tiene otros productos peligrosos (para probar bloqueo automático)

**Pasos:**
1. Seleccionar reporte
2. Hacer clic en "Marcar Peligroso"
3. Ingresar explicación: "Producto prohibido que puede causar daño a los usuarios. Contiene sustancias ilegales."
4. Confirmar

**Resultado Esperado:**
- Status code: 200
- Reporte estado: "resuelto"
- Producto estado: "peligroso"
- Campo `es_peligroso` = true
- Campo `fecha_deteccion_peligroso` = CURRENT_TIMESTAMP
- Si el vendedor tiene 3+ productos peligrosos, su cuenta se bloquea automáticamente

**Validaciones:**
- Estado producto: "peligroso"
- Producto oculto permanentemente
- Verificar bloqueo automático de cuenta (si aplica)

---

## PRUEBA 16: Resolver Reporte - Validación Explicación Mínima
**Tipo:** Validación | **Prioridad:** Alta  
**Objetivo:** Verificar que la explicación de resolución tiene mínimo 10 caracteres.

**Precondiciones:**
- Moderador autenticado
- Reporte pendiente existe

**Pasos:**
1. Seleccionar acción de resolución
2. Ingresar explicación con menos de 10 caracteres: "OK"
3. Intentar confirmar

**Resultado Esperado:**
- Frontend: Muestra error "La explicación debe tener al menos 10 caracteres"
- Backend: Status code 400 si se envía
- Mensaje: "Debes proporcionar una explicación de al menos 10 caracteres"
- La acción NO se ejecuta

**Validaciones:**
- Validación en frontend y backend
- Botón confirmar deshabilitado hasta cumplir requisito

---

## PRUEBA 17: Resolver Reporte - Reporte Ya Resuelto
**Tipo:** Validación | **Prioridad:** Media  
**Objetivo:** Verificar que no se puede resolver un reporte ya procesado.

**Precondiciones:**
- Moderador autenticado
- Reporte en estado "resuelto" existe

**Pasos:**
1. Intentar resolver reporte ya resuelto
2. Enviar acción de resolución

**Resultado Esperado:**
- Status code: 400
- Mensaje: "Este reporte ya fue resuelto"
- No se modifica el reporte ni el producto

**Validaciones:**
- Solo reportes "pendiente" o "en_revision" pueden resolverse

---

## PRUEBA 18: Ver Mis Reportes - Usuario
**Tipo:** Funcional | **Prioridad:** Media  
**Objetivo:** Verificar que un usuario puede ver sus propios reportes.

**Precondiciones:**
- Usuario autenticado (cualquier tipo)
- El usuario tiene reportes creados

**Pasos:**
1. Acceder a GET `/api/reports/my/reports`
2. Ver lista de reportes

**Resultado Esperado:**
- Status code: 200
- Se muestran solo los reportes del usuario actual
- Cada reporte muestra:
  - Producto reportado
  - Tipo de reporte
  - Estado del reporte
  - Información del revisor (si fue resuelto)
  - Fecha de reporte

**Validaciones:**
- Solo reportes del usuario autenticado
- Ordenados por fecha_reporte DESC (más recientes primero)

---

## PRUEBA 19: Ver Reportes de Producto - Propietario
**Tipo:** Funcional | **Prioridad:** Media  
**Objetivo:** Verificar que el propietario de un producto puede ver sus reportes.

**Precondiciones:**
- Vendedor autenticado
- El vendedor tiene un producto con reportes

**Pasos:**
1. Acceder a GET `/api/products/:id/reports`
2. Ver reportes del producto

**Resultado Esperado:**
- Status code: 200
- Se muestran todos los reportes del producto
- Información completa de cada reporte

**Validaciones:**
- Solo propietario del producto o moderadores/administradores pueden ver
- Usuario sin permisos recibe 403

---

## PRUEBA 20: Estadísticas de Reportes
**Tipo:** Funcional | **Prioridad:** Baja  
**Objetivo:** Verificar que las estadísticas de reportes se calculan correctamente.

**Precondiciones:**
- Moderador autenticado
- Existen reportes en diferentes estados y tipos

**Pasos:**
1. Acceder a GET `/api/reports/statistics`
2. Ver estadísticas

**Resultado Esperado:**
- Status code: 200
- Se muestran las siguientes estadísticas:
  - Total de reportes
  - Reportes pendientes
  - Reportes en revisión
  - Reportes resueltos
  - Reportes por tipo (contenido_inapropiado, producto_prohibido, informacion_falsa, spam)

**Validaciones:**
- Los conteos son correctos
- Las estadísticas se actualizan en tiempo real

---

## PRUEBA ADICIONAL 21: Interfaz Usuario - Visualización Reportes
**Tipo:** UI/UX | **Prioridad:** Media  
**Objetivo:** Verificar que la interfaz muestra correctamente toda la información.

**Precondiciones:**
- Moderador autenticado
- Reportes pendientes existen

**Pasos:**
1. Acceder a página de gestión de reportes
2. Verificar elementos visuales

**Resultado Esperado:**
- Tarjetas de estadísticas visibles (Pendientes, En Revisión, Resueltos, Total)
- Filtros funcionan correctamente
- Cada reporte muestra:
  - Imagen del producto (o placeholder)
  - Badge de estado con color apropiado
  - Información completa del producto
  - Información del reportante
  - Botones de acción visibles y funcionales
- Diseño responsive en móvil

---

## PRUEBA ADICIONAL 22: Acceso No Autenticado
**Tipo:** Seguridad | **Prioridad:** Crítica  
**Objetivo:** Verificar que usuarios no autenticados no pueden crear reportes.

**Precondiciones:**
- Sin sesión activa

**Pasos:**
1. Intentar crear reporte sin autenticación
2. Hacer petición POST a `/api/products/:id/report` sin token

**Resultado Esperado:**
- Status code: 401
- Mensaje: "Autenticación requerida" o similar
- No se crea el reporte

**Validaciones:**
- Middleware `authenticate` bloquea acceso
- Todas las rutas de reportes requieren autenticación

---

## Matriz de Cobertura

| Funcionalidad | Pruebas | Cobertura |
|--------------|---------|-----------|
| Crear reporte | 1, 2, 3, 4, 5, 6, 7 | Alta |
| Ver reportes | 8, 9, 18, 19 | Media |
| Resolver reportes | 12, 13, 14, 15, 16, 17 | Alta |
| Filtros | 10, 11 | Media |
| Permisos | 5, 9, 22 | Alta |
| Estadísticas | 20 | Baja |
| UI/UX | 21 | Media |

---

## Notas de Ejecución

1. **Datos de Prueba:** Asegurar que existan productos, usuarios de diferentes tipos, y reportes en varios estados antes de ejecutar las pruebas.

2. **Ambiente:** Ejecutar en ambiente de desarrollo/testing con base de datos de pruebas.

3. **Orden Recomendado:**
   - Primero pruebas de creación (1-7)
   - Luego pruebas de visualización (8-11, 18-19)
   - Después pruebas de resolución (12-17)
   - Finalmente pruebas de estadísticas y UI (20-21)

4. **Casos Edge:** Considerar también:
   - Reportes con caracteres especiales en descripción
   - Reportes con URLs o HTML en descripción
   - Reportes de productos eliminados
   - Reportes concurrentes (múltiples usuarios reportando el mismo producto)

---

**Fecha de Creación:** [Fecha Actual]  
**Versión del Sistema:** [Versión]  
**Autor:** Sistema de Pruebas Automatizadas




