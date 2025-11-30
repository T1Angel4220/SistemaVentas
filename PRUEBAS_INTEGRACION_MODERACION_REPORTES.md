# Pruebas de Integración - Módulo de Moderación y Reportes

## Tabla General

| Número del Caso de Prueba | Componente | Descripción de lo que se Probará | Prerrequisitos |
|---------------------------|------------|-----------------------------------|----------------|
| CP-001 | Crear Reporte | Verificar que un comprador puede crear un reporte de producto con datos válidos | Usuario comprador autenticado, producto activo existente en el sistema |
| CP-002 | Crear Reporte (Moderador) | Verificar que un moderador puede crear un reporte de producto | Usuario moderador autenticado, producto activo existente |
| CP-003 | Validación Reporte Propio | Verificar que un comprador no puede reportar su propio producto | Usuario comprador autenticado, producto propio activo |
| CP-004 | Validación Reporte Duplicado | Verificar que un usuario no puede reportar el mismo producto dos veces | Usuario autenticado, producto ya reportado por el mismo usuario |
| CP-005 | Listar Reportes Pendientes | Verificar que un moderador puede ver la lista de reportes pendientes con filtros | Usuario moderador autenticado, al menos un reporte pendiente en el sistema |
| CP-006 | Resolver Reporte - Aprobar | Verificar que un moderador puede aprobar un reporte (producto válido) | Usuario moderador autenticado, reporte en estado pendiente |
| CP-007 | Resolver Reporte - Rechazar | Verificar que un moderador puede rechazar un producto mediante reporte | Usuario moderador autenticado, reporte en estado pendiente, producto activo |
| CP-008 | Resolver Reporte - Suspender | Verificar que un moderador puede suspender un producto mediante reporte | Usuario moderador autenticado, reporte en estado pendiente, producto activo |
| CP-009 | Resolver Reporte - Marcar Peligroso | Verificar que un moderador puede marcar un producto como peligroso | Usuario moderador autenticado, reporte en estado pendiente, producto activo |
| CP-010 | Crear Apelación | Verificar que un vendedor puede crear una apelación para su producto rechazado | Usuario vendedor autenticado, producto en estado rechazado o suspendido (no peligroso) |
| CP-011 | Resolver Apelación - Aprobar | Verificar que un moderador puede aprobar una apelación y reactivar el producto | Usuario moderador autenticado, apelación en estado en_apelacion, producto rechazado/suspendido |
| CP-012 | Resolver Apelación - Rechazar | Verificar que un moderador puede rechazar una apelación manteniendo el estado del producto | Usuario moderador autenticado, apelación en estado en_apelacion, producto rechazado/suspendido |

---

## CP-001: Crear Reporte

### Tabla Específica

| Paso | Descripción de pasos a seguir | Datos Entrada | Resultado Esperado | Resultado Obtenido | Observaciones |
|------|-------------------------------|---------------|-------------------|-------------------|---------------|
| 1 | Autenticar usuario comprador en el sistema | Correo: comprador@test.com, Password: password123 | Token de autenticación válido | | Verificar que el usuario tiene rol "comprador" |
| 2 | Obtener ID de un producto activo existente | Producto con estado "activo" | ID del producto (ej: 1) | | El producto debe existir y estar activo |
| 3 | Enviar petición POST para crear reporte | Endpoint: POST /api/products/:id/report<br>Headers: Authorization: Bearer {token}<br>Body: {<br>  "tipo_reporte": "contenido_inapropiado",<br>  "motivo_reporte": "El producto contiene imágenes inapropiadas que violan las políticas",<br>  "informacion_adicional": "Sección de imágenes, tercera foto"<br>} | Status 201, respuesta JSON con success: true, mensaje de confirmación y datos del reporte creado | | El reporte debe crearse con estado "pendiente" |
| 4 | Verificar en base de datos que el reporte fue creado | Consultar tabla reportes con item_id y usuario_reportador_id | Registro del reporte con estado "pendiente", fecha_reporte actual, tipo_reporte y descripcion correctos | | Verificar integridad de datos |
| 5 | Verificar que el producto mantiene su estado original | Consultar tabla items con el ID del producto | El producto mantiene estado "activo" | | El reporte no debe cambiar el estado del producto inicialmente |

---

## CP-002: Crear Reporte (Moderador)

### Tabla Específica

| Paso | Descripción de pasos a seguir | Datos Entrada | Resultado Esperado | Resultado Obtenido | Observaciones |
|------|-------------------------------|---------------|-------------------|-------------------|---------------|
| 1 | Autenticar usuario moderador en el sistema | Correo: moderador@test.com, Password: password123 | Token de autenticación válido | | Verificar que el usuario tiene rol "moderador" |
| 2 | Obtener ID de un producto activo existente | Producto con estado "activo" | ID del producto (ej: 2) | | El producto debe existir y estar activo |
| 3 | Enviar petición POST para crear reporte | Endpoint: POST /api/products/:id/report<br>Headers: Authorization: Bearer {token}<br>Body: {<br>  "tipo_reporte": "producto_prohibido",<br>  "motivo_reporte": "Este producto está en la lista de productos prohibidos según las políticas de la plataforma",<br>  "informacion_adicional": "Ver categoría y descripción completa"<br>} | Status 201, respuesta JSON con success: true, mensaje indicando que será revisado por otro moderador, datos del reporte | | El mensaje debe diferenciar que es un moderador quien reporta |
| 4 | Verificar en base de datos que el reporte fue creado | Consultar tabla reportes | Registro del reporte con estado "pendiente", usuario_reportador_id del moderador | | Verificar que moderadores pueden reportar productos |
| 5 | Verificar mensaje diferenciado en respuesta | Revisar campo "message" en la respuesta | Mensaje debe mencionar "otro moderador o administrador" | | Validar lógica de mensajes según tipo de usuario |

---

## CP-003: Validación Reporte Propio

### Tabla Específica

| Paso | Descripción de pasos a seguir | Datos Entrada | Resultado Esperado | Resultado Obtenido | Observaciones |
|------|-------------------------------|---------------|-------------------|-------------------|---------------|
| 1 | Autenticar usuario comprador en el sistema | Correo: comprador@test.com, Password: password123 | Token de autenticación válido | | Usuario con rol "comprador" |
| 2 | Obtener ID de un producto propio del usuario | Producto donde vendedor_id = usuario_id | ID del producto (ej: 3) | | El producto debe pertenecer al usuario autenticado |
| 3 | Enviar petición POST para crear reporte de producto propio | Endpoint: POST /api/products/:id/report<br>Headers: Authorization: Bearer {token}<br>Body: {<br>  "tipo_reporte": "informacion_falsa",<br>  "motivo_reporte": "Necesito corregir información del producto"<br>} | Status 400, respuesta JSON con success: false, mensaje: "No puedes reportar tu propio producto" | | Validar regla de negocio |
| 4 | Verificar que no se creó ningún reporte | Consultar tabla reportes con item_id y usuario_reportador_id | No debe existir ningún registro | | Verificar integridad de datos |
| 5 | Verificar que el producto no cambió de estado | Consultar tabla items | El producto mantiene su estado original | | Validar que no hay efectos secundarios |

---

## CP-004: Validación Reporte Duplicado

### Tabla Específica

| Paso | Descripción de pasos a seguir | Datos Entrada | Resultado Esperado | Resultado Obtenido | Observaciones |
|------|-------------------------------|---------------|-------------------|-------------------|---------------|
| 1 | Autenticar usuario en el sistema | Correo: usuario@test.com, Password: password123 | Token de autenticación válido | | Usuario autenticado |
| 2 | Obtener ID de un producto que ya fue reportado por este usuario | Producto con reporte existente del mismo usuario | ID del producto (ej: 4) | | Debe existir un reporte previo del mismo usuario para este producto |
| 3 | Enviar petición POST para crear reporte duplicado | Endpoint: POST /api/products/:id/report<br>Headers: Authorization: Bearer {token}<br>Body: {<br>  "tipo_reporte": "spam",<br>  "motivo_reporte": "Este producto es spam y debe ser eliminado"<br>} | Status 400, respuesta JSON con success: false, mensaje: "Ya has reportado este producto anteriormente" | | Validar prevención de reportes duplicados |
| 4 | Verificar que no se creó un nuevo reporte | Consultar tabla reportes con item_id y usuario_reportador_id | Debe existir solo un reporte (el original) | | Verificar integridad de datos |
| 5 | Verificar que el reporte original no fue modificado | Consultar el reporte original | El reporte original mantiene sus datos y estado | | Validar que no hay efectos secundarios |

---

## CP-005: Listar Reportes Pendientes

### Tabla Específica

| Paso | Descripción de pasos a seguir | Datos Entrada | Resultado Esperado | Resultado Obtenido | Observaciones |
|------|-------------------------------|---------------|-------------------|-------------------|---------------|
| 1 | Autenticar usuario moderador en el sistema | Correo: moderador@test.com, Password: password123 | Token de autenticación válido | | Usuario con permisos de moderación |
| 2 | Asegurar que existen reportes pendientes en el sistema | Al menos un reporte con estado "pendiente" o "en_revision" | Reportes disponibles | | Preparar datos de prueba |
| 3 | Enviar petición GET para listar reportes pendientes sin filtros | Endpoint: GET /api/reports/pending<br>Headers: Authorization: Bearer {token} | Status 200, respuesta JSON con success: true, array de reportes con información completa (producto, reportante, vendedor, etc.) | | Verificar estructura de respuesta |
| 4 | Enviar petición GET con filtro por tipo de reporte | Endpoint: GET /api/reports/pending?tipo_reporte=contenido_inapropiado<br>Headers: Authorization: Bearer {token} | Status 200, respuesta JSON con solo reportes del tipo especificado | | Validar filtrado por tipo |
| 5 | Enviar petición GET con filtro por estado | Endpoint: GET /api/reports/pending?estado=pendiente<br>Headers: Authorization: Bearer {token} | Status 200, respuesta JSON con solo reportes en estado "pendiente" | | Validar filtrado por estado |
| 6 | Enviar petición GET con ambos filtros | Endpoint: GET /api/reports/pending?tipo_reporte=producto_prohibido&estado=en_revision<br>Headers: Authorization: Bearer {token} | Status 200, respuesta JSON con reportes que cumplen ambos criterios | | Validar filtrado combinado |
| 7 | Verificar estructura de cada reporte en la respuesta | Revisar campos de cada objeto en el array | Cada reporte debe incluir: id, item_id, tipo_reporte, descripcion, estado, producto_nombre, reportante_nombre, vendedor_nombre, total_reportes_producto, etc. | | Validar completitud de datos |

---

## CP-006: Resolver Reporte - Aprobar

### Tabla Específica

| Paso | Descripción de pasos a seguir | Datos Entrada | Resultado Esperado | Resultado Obtenido | Observaciones |
|------|-------------------------------|---------------|-------------------|-------------------|---------------|
| 1 | Autenticar usuario moderador en el sistema | Correo: moderador@test.com, Password: password123 | Token de autenticación válido | | Usuario con permisos de moderación |
| 2 | Obtener ID de un reporte en estado pendiente | Reporte con estado "pendiente" | ID del reporte (ej: 5) | | El reporte debe estar pendiente |
| 3 | Enviar petición PATCH para resolver reporte aprobando el producto | Endpoint: PATCH /api/reports/:id/resolve<br>Headers: Authorization: Bearer {token}, Content-Type: application/json<br>Body: {<br>  "accion": "aprobar",<br>  "decision_final": "Tras revisar el producto, se confirma que cumple con todas las políticas de la plataforma. El reporte era infundado."<br>} | Status 200, respuesta JSON con success: true, mensaje indicando que el producto está activo, datos del reporte actualizado | | Validar resolución exitosa |
| 4 | Verificar en base de datos que el reporte fue actualizado | Consultar tabla reportes con el ID del reporte | Estado = "resuelto", decision_final contiene la explicación, moderador_resolutor_id = ID del moderador, fecha_resolucion actualizada | | Verificar actualización del reporte |
| 5 | Verificar que el producto fue actualizado | Consultar tabla items con item_id del reporte | Estado = "activo", moderador_revision_id = ID del moderador, fecha_revision actualizada | | Validar cambio de estado del producto |
| 6 | Verificar que no se marcó como peligroso | Consultar campo es_peligroso en items | es_peligroso = false | | Validar lógica de aprobación |

---

## CP-007: Resolver Reporte - Rechazar

### Tabla Específica

| Paso | Descripción de pasos a seguir | Datos Entrada | Resultado Esperado | Resultado Obtenido | Observaciones |
|------|-------------------------------|---------------|-------------------|-------------------|---------------|
| 1 | Autenticar usuario moderador en el sistema | Correo: moderador@test.com, Password: password123 | Token de autenticación válido | | Usuario con permisos de moderación |
| 2 | Obtener ID de un reporte en estado pendiente | Reporte con estado "pendiente", producto activo | ID del reporte (ej: 6) | | El reporte y producto deben existir |
| 3 | Enviar petición PATCH para resolver reporte rechazando el producto | Endpoint: PATCH /api/reports/:id/resolve<br>Headers: Authorization: Bearer {token}, Content-Type: application/json<br>Body: {<br>  "accion": "rechazar",<br>  "decision_final": "El producto viola las políticas de contenido. Se rechaza por contener información falsa sobre las características del producto.",<br>  "marcar_peligroso": false<br>} | Status 200, respuesta JSON con success: true, mensaje indicando que el producto fue rechazado, datos actualizados | | Validar resolución exitosa |
| 4 | Verificar en base de datos que el reporte fue actualizado | Consultar tabla reportes | Estado = "resuelto", decision_final contiene la explicación, moderador_resolutor_id actualizado | | Verificar actualización del reporte |
| 5 | Verificar que el producto fue rechazado | Consultar tabla items | Estado = "rechazado", motivo_rechazo contiene la explicación, moderador_revision_id actualizado | | Validar cambio de estado del producto |
| 6 | Verificar que el producto no está marcado como peligroso | Consultar campo es_peligroso | es_peligroso = false | | Validar que rechazar no marca como peligroso por defecto |

---

## CP-008: Resolver Reporte - Suspender

### Tabla Específica

| Paso | Descripción de pasos a seguir | Datos Entrada | Resultado Esperado | Resultado Obtenido | Observaciones |
|------|-------------------------------|---------------|-------------------|-------------------|---------------|
| 1 | Autenticar usuario moderador en el sistema | Correo: moderador@test.com, Password: password123 | Token de autenticación válido | | Usuario con permisos de moderación |
| 2 | Obtener ID de un reporte en estado pendiente | Reporte con estado "pendiente", producto activo | ID del reporte (ej: 7) | | El reporte y producto deben existir |
| 3 | Enviar petición PATCH para resolver reporte suspendiendo el producto | Endpoint: PATCH /api/reports/:id/resolve<br>Headers: Authorization: Bearer {token}, Content-Type: application/json<br>Body: {<br>  "accion": "suspender",<br>  "decision_final": "El producto queda suspendido temporalmente mientras se investiga más a fondo la denuncia recibida.",<br>  "marcar_peligroso": false<br>} | Status 200, respuesta JSON con success: true, mensaje indicando que el producto fue suspendido, datos actualizados | | Validar resolución exitosa |
| 4 | Verificar en base de datos que el reporte fue actualizado | Consultar tabla reportes | Estado = "resuelto", decision_final contiene la explicación, moderador_resolutor_id actualizado | | Verificar actualización del reporte |
| 5 | Verificar que el producto fue suspendido | Consultar tabla items | Estado = "suspendido", moderador_revision_id actualizado, fecha_revision actualizada | | Validar cambio de estado del producto |
| 6 | Verificar que el producto puede ser apelado | Consultar estado del producto | Estado = "suspendido" (permite apelación) | | Validar que productos suspendidos pueden apelarse |

---

## CP-009: Resolver Reporte - Marcar Peligroso

### Tabla Específica

| Paso | Descripción de pasos a seguir | Datos Entrada | Resultado Esperado | Resultado Obtenido | Observaciones |
|------|-------------------------------|---------------|-------------------|-------------------|---------------|
| 1 | Autenticar usuario moderador en el sistema | Correo: moderador@test.com, Password: password123 | Token de autenticación válido | | Usuario con permisos de moderación |
| 2 | Obtener ID de un reporte en estado pendiente | Reporte con estado "pendiente", producto activo | ID del reporte (ej: 8) | | El reporte y producto deben existir |
| 3 | Enviar petición PATCH para resolver reporte marcando como peligroso | Endpoint: PATCH /api/reports/:id/resolve<br>Headers: Authorization: Bearer {token}, Content-Type: application/json<br>Body: {<br>  "accion": "eliminar",<br>  "decision_final": "Este producto representa un peligro grave para los usuarios. Contiene elementos que violan gravemente las políticas de seguridad.",<br>  "marcar_peligroso": true<br>} | Status 200, respuesta JSON con success: true, mensaje indicando que el producto fue marcado como peligroso, datos actualizados | | Validar resolución exitosa |
| 4 | Verificar en base de datos que el reporte fue actualizado | Consultar tabla reportes | Estado = "resuelto", decision_final contiene la explicación, moderador_resolutor_id actualizado | | Verificar actualización del reporte |
| 5 | Verificar que el producto fue marcado como peligroso | Consultar tabla items | Estado = "peligroso", es_peligroso = true, fecha_deteccion_peligroso actualizada, moderador_revision_id actualizado | | Validar cambio de estado del producto |
| 6 | Verificar que productos peligrosos no pueden apelarse | Intentar crear apelación para este producto | Error indicando que productos peligrosos no pueden apelarse | | Validar regla de negocio crítica |

---

## CP-010: Crear Apelación

### Tabla Específica

| Paso | Descripción de pasos a seguir | Datos Entrada | Resultado Esperado | Resultado Obtenido | Observaciones |
|------|-------------------------------|---------------|-------------------|-------------------|---------------|
| 1 | Autenticar usuario vendedor en el sistema | Correo: vendedor@test.com, Password: password123 | Token de autenticación válido | | Usuario con rol "vendedor" |
| 2 | Obtener ID de un producto propio en estado rechazado o suspendido | Producto donde vendedor_id = usuario_id, estado = "rechazado" o "suspendido", es_peligroso = false | ID del producto (ej: 9) | | El producto debe pertenecer al usuario y estar rechazado/suspendido |
| 3 | Enviar petición POST para crear apelación | Endpoint: POST /api/products/:id/appeal<br>Headers: Authorization: Bearer {token}, Content-Type: application/json<br>Body: {<br>  "motivo_apelacion": "Considero que la decisión fue incorrecta. El producto cumple con todas las políticas y la información es verídica. Adjunto documentación adicional.",<br>  "informacion_adicional": "Documentos de certificación del producto"<br>} | Status 201, respuesta JSON con success: true, mensaje indicando que será revisada por un moderador, datos de la apelación creada | | Validar creación exitosa |
| 4 | Verificar en base de datos que la apelación fue creada | Consultar tabla apelaciones con item_id y usuario_apelante_id | Registro de apelación con estado "en_apelacion", motivo_apelacion correcto, fecha_apelacion actual | | Verificar integridad de datos |
| 5 | Verificar que el estado del producto cambió a "en_apelacion" | Consultar tabla items con el ID del producto | Estado = "en_apelacion" | | Validar cambio automático de estado |
| 6 | Intentar crear segunda apelación para el mismo producto | Enviar otra petición POST con el mismo producto | Status 400, mensaje: "Ya existe una apelación pendiente para este producto" | | Validar prevención de apelaciones duplicadas |

---

## CP-011: Resolver Apelación - Aprobar

### Tabla Específica

| Paso | Descripción de pasos a seguir | Datos Entrada | Resultado Esperado | Resultado Obtenido | Observaciones |
|------|-------------------------------|---------------|-------------------|-------------------|---------------|
| 1 | Autenticar usuario moderador en el sistema | Correo: moderador@test.com, Password: password123 | Token de autenticación válido | | Usuario con permisos de moderación |
| 2 | Obtener ID de una apelación en estado en_apelacion | Apelación con estado "en_apelacion", producto rechazado o suspendido | ID de la apelación (ej: 10) | | La apelación debe estar pendiente |
| 3 | Enviar petición PATCH para resolver apelación aprobándola | Endpoint: PATCH /api/appeals/:id/resolve<br>Headers: Authorization: Bearer {token}, Content-Type: application/json<br>Body: {<br>  "decision": "aprobar",<br>  "decision_apelacion": "Tras revisar la apelación y la documentación adicional, se determina que el producto cumple con las políticas. La decisión anterior se revierte y el producto queda activo."<br>} | Status 200, respuesta JSON con success: true, mensaje indicando que la apelación fue aprobada, datos actualizados | | Validar resolución exitosa |
| 4 | Verificar en base de datos que la apelación fue actualizada | Consultar tabla apelaciones con el ID | Estado = "resuelto", decision_apelacion contiene la explicación, moderador_revisor_id = ID del moderador, fecha_resolucion_apelacion actualizada | | Verificar actualización de la apelación |
| 5 | Verificar que el producto fue reactivado | Consultar tabla items con item_id de la apelación | Estado = "activo", disponibilidad = true, motivo_rechazo = NULL, es_peligroso = false, moderador_revision_id actualizado | | Validar reactivación completa del producto |
| 6 | Verificar que se limpiaron campos de rechazo | Consultar campos motivo_rechazo y es_peligroso | motivo_rechazo = NULL, es_peligroso = false | | Validar limpieza de datos de rechazo |

---

## CP-012: Resolver Apelación - Rechazar

### Tabla Específica

| Paso | Descripción de pasos a seguir | Datos Entrada | Resultado Esperado | Resultado Obtenido | Observaciones |
|------|-------------------------------|---------------|-------------------|-------------------|---------------|
| 1 | Autenticar usuario moderador en el sistema | Correo: moderador@test.com, Password: password123 | Token de autenticación válido | | Usuario con permisos de moderación |
| 2 | Obtener ID de una apelación en estado en_apelacion | Apelación con estado "en_apelacion", producto rechazado o suspendido | ID de la apelación (ej: 11) | | La apelación debe estar pendiente |
| 3 | Enviar petición PATCH para resolver apelación rechazándola | Endpoint: PATCH /api/appeals/:id/resolve<br>Headers: Authorization: Bearer {token}, Content-Type: application/json<br>Body: {<br>  "decision": "rechazar",<br>  "decision_apelacion": "Tras revisar la apelación, se confirma que la decisión original fue correcta. El producto no cumple con las políticas establecidas y la apelación es rechazada."<br>} | Status 200, respuesta JSON con success: true, mensaje indicando que la apelación fue rechazada, datos actualizados | | Validar resolución exitosa |
| 4 | Verificar en base de datos que la apelación fue actualizada | Consultar tabla apelaciones con el ID | Estado = "rechazado", decision_apelacion contiene la explicación, moderador_revisor_id = ID del moderador, fecha_resolucion_apelacion actualizada | | Verificar actualización de la apelación |
| 5 | Verificar que el producto mantiene su estado de rechazo/suspensión | Consultar tabla items con item_id de la apelación | Estado = "rechazado" o "suspendido" (según estado original), moderador_revision_id actualizado | | Validar que el producto no se reactiva |
| 6 | Verificar que no se puede crear otra apelación | Intentar crear nueva apelación para el mismo producto | Error indicando que ya existe una apelación resuelta o que el producto no está en estado apelable | | Validar reglas de negocio |

---

## Notas Generales

1. **Autenticación**: Todos los casos requieren tokens JWT válidos obtenidos mediante el endpoint de autenticación.

2. **Base de Datos**: Se asume que existe una base de datos PostgreSQL con las tablas: `usuarios`, `items`, `reportes`, `apelaciones`.

3. **Estados de Producto**: Los estados válidos son: `activo`, `rechazado`, `suspendido`, `peligroso`, `en_apelacion`.

4. **Estados de Reporte**: Los estados válidos son: `pendiente`, `en_revision`, `resuelto`.

5. **Estados de Apelación**: Los estados válidos son: `en_apelacion`, `pendiente`, `resuelto`, `rechazado`.

6. **Tipos de Reporte**: Los tipos válidos son: `contenido_inapropiado`, `producto_prohibido`, `informacion_falsa`, `spam`, `otro`.

7. **Validaciones**: Todos los endpoints validan longitud mínima de campos de texto (20 caracteres para motivo_reporte, 10 caracteres para decision_final).

8. **Permisos**: Solo usuarios con rol `moderador` o `administrador` pueden resolver reportes y apelaciones.

9. **Reglas de Negocio**:
   - Los compradores no pueden reportar sus propios productos
   - Los productos peligrosos no pueden ser apelados
   - No se pueden crear reportes o apelaciones duplicados
   - Al aprobar una apelación, el producto se reactiva completamente

10. **Integración Frontend-Backend**: Las pruebas deben validar que el frontend envía las peticiones correctamente y maneja las respuestas adecuadamente.

