# Documento de Pruebas - Módulo de Moderación y Reportes

## Tabla General de Pruebas

| Código | Módulo | Submódulo | Descripción | Enfoque | Complejidad | Prerrequisitos |
|--------|--------|-----------|-------------|---------|-------------|----------------|
| CP-001 | Moderación/Reportes | Crear Reporte | Verificar que un comprador puede crear un reporte de producto exitosamente | Funcional | Media | Usuario comprador autenticado, producto activo existente, producto no pertenece al usuario |
| CP-002 | Moderación/Reportes | Validación Reporte | Verificar que el sistema rechaza reportes con motivo menor a 20 caracteres | Validación | Baja | Usuario autenticado (comprador o moderador), producto existe en el sistema |
| CP-003 | Moderación/Reportes | Validación Reporte | Verificar que el sistema rechaza tipos de reporte no válidos | Validación | Baja | Usuario autenticado, producto existe |
| CP-004 | Moderación/Reportes | Validación Reporte | Verificar manejo de error cuando el producto no existe | Validación | Baja | Usuario autenticado, ID de producto inexistente |
| CP-005 | Moderación/Reportes | Validación Reporte | Verificar que un comprador no puede reportar su propio producto | Validación | Media | Usuario comprador autenticado, producto pertenece al mismo usuario |
| CP-006 | Moderación/Reportes | Validación Reporte | Verificar que un usuario no puede reportar el mismo producto dos veces | Validación | Media | Usuario autenticado, ya existe un reporte del usuario para el mismo producto |
| CP-007 | Moderación/Reportes | Crear Reporte | Verificar que un moderador puede crear reportes con mensaje diferenciado | Funcional | Media | Usuario moderador autenticado, producto activo existe |
| CP-008 | Moderación/Reportes | Ver Reportes | Verificar que un moderador puede ver la lista de reportes pendientes | Funcional | Media | Usuario moderador o administrador autenticado, existen reportes pendientes en el sistema |
| CP-009 | Moderación/Reportes | Permisos | Verificar que usuarios sin permisos no pueden acceder a reportes pendientes | Seguridad | Media | Usuario comprador o vendedor autenticado |
| CP-010 | Moderación/Reportes | Filtros | Verificar que los filtros de tipo de reporte funcionan correctamente | Funcional | Media | Moderador autenticado, existen reportes de diferentes tipos |
| CP-011 | Moderación/Reportes | Filtros | Verificar que los filtros de estado funcionan correctamente | Funcional | Media | Moderador autenticado, existen reportes en diferentes estados |
| CP-012 | Moderación/Reportes | Resolver Reporte | Verificar que un moderador puede aprobar un reporte (producto válido) | Funcional | Media | Moderador autenticado, reporte en estado "pendiente" existe |
| CP-013 | Moderación/Reportes | Resolver Reporte | Verificar que un moderador puede rechazar un producto reportado | Funcional | Media | Moderador autenticado, reporte pendiente existe, producto en estado "activo" |
| CP-014 | Moderación/Reportes | Resolver Reporte | Verificar suspensión temporal de producto mediante reporte | Funcional | Media | Moderador autenticado, reporte pendiente existe |
| CP-015 | Moderación/Reportes | Resolver Reporte | Verificar que productos peligrosos se marcan correctamente | Funcional | Alta | Moderador autenticado, reporte pendiente existe, vendedor tiene otros productos peligrosos (para probar bloqueo automático) |
| CP-016 | Moderación/Reportes | Validación Resolución | Verificar que la explicación de resolución tiene mínimo 10 caracteres | Validación | Baja | Moderador autenticado, reporte pendiente existe |
| CP-017 | Moderación/Reportes | Validación Resolución | Verificar que no se puede resolver un reporte ya procesado | Validación | Media | Moderador autenticado, reporte en estado "resuelto" existe |
| CP-018 | Moderación/Reportes | Ver Reportes | Verificar que un usuario puede ver sus propios reportes | Funcional | Media | Usuario autenticado (cualquier tipo), el usuario tiene reportes creados |
| CP-019 | Moderación/Reportes | Ver Reportes | Verificar que el propietario de un producto puede ver sus reportes | Funcional | Media | Vendedor autenticado, el vendedor tiene un producto con reportes |
| CP-020 | Moderación/Reportes | Estadísticas | Verificar que las estadísticas de reportes se calculan correctamente | Funcional | Baja | Moderador autenticado, existen reportes en diferentes estados y tipos |

---

## CP-001: Crear Reporte Exitoso - Comprador

| Campo | Valor |
|-------|-------|
| **Id** | CP-001 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Crear Reporte |
| **Función por probar** | Al ingresar como un comprador autenticado, se puede crear un reporte de producto con datos válidos y el reporte se registra en estado "pendiente" |
| **Prerrequisitos** | • El usuario comprador de prueba debe existir en la base de datos con email comprador@test.com y contraseña password123<br>• El usuario debe estar en estado "activo" y con email verificado<br>• Debe existir un producto activo en el sistema que no pertenezca al usuario<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "comprador@test.com"<br>    ○ Contraseña: "password123"<br>• Producto:<br>    ○ ID de producto activo existente<br>• Reporte:<br>    ○ Tipo: "contenido_inapropiado"<br>    ○ Motivo: "Este producto contiene imágenes ofensivas que violan las políticas de la plataforma"<br>    ○ Información adicional (opcional): "La imagen principal muestra contenido inadecuado" |
| **Acciones** | • Autenticar usuario comprador en el sistema<br>• Obtener ID de un producto activo existente que no pertenezca al usuario<br>• Enviar petición POST para crear reporte<br>    ○ Endpoint: POST /api/products/:id/report<br>    ○ Headers: Authorization: Bearer {token}<br>    ○ Body: {<br>      "tipo_reporte": "contenido_inapropiado",<br>      "motivo_reporte": "Este producto contiene imágenes ofensivas que violan las políticas de la plataforma",<br>      "informacion_adicional": "La imagen principal muestra contenido inadecuado"<br>    }<br>• Verificar en base de datos que el reporte fue creado<br>• Verificar que el producto mantiene su estado original |
| **Resultados esperados** | • El reporte se crea exitosamente<br>• Status code: 201<br>• Respuesta JSON con success: true<br>• Mensaje: "Reporte creado exitosamente. Será revisado por un moderador."<br>• El reporte queda en estado "pendiente"<br>• Se registra en la base de datos con los datos correctos<br>• El producto mantiene estado "activo" |
| **Criterios de aceptación** | • El reporte es creado con estado "pendiente"<br>• Campo `tipo_reporte` = 'contenido_inapropiado'<br>• Campo `usuario_reportador_id` = ID del usuario actual<br>• Campo `item_id` = ID del producto reportado<br>• Campo `fecha_reporte` = fecha actual<br>• El producto mantiene su estado original (activo) |

---

## CP-002: Crear Reporte - Validación de Motivo Mínimo

| Campo | Valor |
|-------|-------|
| **Id** | CP-002 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Validación Reporte |
| **Función por probar** | Al intentar crear un reporte con motivo menor a 20 caracteres, el sistema rechaza la petición y muestra mensaje de error |
| **Prerrequisitos** | • El usuario de prueba debe existir en la base de datos (comprador o moderador)<br>• El usuario debe estar en estado "activo" y con email verificado<br>• Debe existir un producto activo en el sistema<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "comprador@test.com" o "moderador@test.com"<br>    ○ Contraseña: "password123"<br>• Producto:<br>    ○ ID de producto activo existente<br>• Reporte:<br>    ○ Tipo: "producto_prohibido"<br>    ○ Motivo: "Es ilegal" (menos de 20 caracteres) |
| **Acciones** | • Autenticar usuario en el sistema<br>• Obtener ID de un producto activo existente<br>• Enviar petición POST para crear reporte con motivo inválido<br>    ○ Endpoint: POST /api/products/:id/report<br>    ○ Headers: Authorization: Bearer {token}<br>    ○ Body: {<br>      "tipo_reporte": "producto_prohibido",<br>      "motivo_reporte": "Es ilegal"<br>    }<br>• Verificar que no se creó ningún reporte en la base de datos |
| **Resultados esperados** | • El sistema muestra error de validación<br>• Status code: 400<br>• Mensaje: "El motivo del reporte debe tener al menos 20 caracteres"<br>• El reporte NO se crea<br>• No se inserta registro en la tabla `reportes` |
| **Criterios de aceptación** | • El sistema rechaza reportes con motivo menor a 20 caracteres<br>• Se muestra mensaje de error claro<br>• No se crea ningún registro en la base de datos<br>• El formulario mantiene los datos ingresados (si aplica) |

---

## CP-003: Crear Reporte - Tipo de Reporte Inválido

| Campo | Valor |
|-------|-------|
| **Id** | CP-003 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Validación Reporte |
| **Función por probar** | Al intentar crear un reporte con tipo de reporte inválido, el sistema rechaza la petición y muestra mensaje de error |
| **Prerrequisitos** | • El usuario de prueba debe existir en la base de datos<br>• El usuario debe estar en estado "activo" y con email verificado<br>• Debe existir un producto activo en el sistema<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "comprador@test.com"<br>    ○ Contraseña: "password123"<br>• Producto:<br>    ○ ID de producto activo existente<br>• Reporte:<br>    ○ Tipo: "tipo_invalido" (no válido)<br>    ○ Motivo: "Este es un motivo válido con más de veinte caracteres para cumplir con el requisito mínimo" |
| **Acciones** | • Autenticar usuario en el sistema<br>• Obtener ID de un producto activo existente<br>• Enviar petición POST para crear reporte con tipo inválido<br>    ○ Endpoint: POST /api/products/:id/report<br>    ○ Headers: Authorization: Bearer {token}<br>    ○ Body: {<br>      "tipo_reporte": "tipo_invalido",<br>      "motivo_reporte": "Este es un motivo válido con más de veinte caracteres para cumplir con el requisito mínimo"<br>    }<br>• Verificar que no se creó ningún reporte |
| **Resultados esperados** | • Status code: 400<br>• Mensaje: "Tipo de reporte inválido. Debe ser uno de: contenido_inapropiado, producto_prohibido, informacion_falsa, spam, otro"<br>• El reporte NO se crea |
| **Criterios de aceptación** | • Solo se aceptan estos tipos: contenido_inapropiado, producto_prohibido, informacion_falsa, spam, otro<br>• Se muestra mensaje de error claro indicando los tipos válidos<br>• No se crea ningún registro en la base de datos |

---

## CP-004: Crear Reporte - Producto No Encontrado

| Campo | Valor |
|-------|-------|
| **Id** | CP-004 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Validación Reporte |
| **Función por probar** | Al intentar crear un reporte para un producto que no existe, el sistema retorna error 404 |
| **Prerrequisitos** | • El usuario de prueba debe existir en la base de datos<br>• El usuario debe estar en estado "activo" y con email verificado<br>• ID de producto inexistente (ej: 99999)<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "comprador@test.com"<br>    ○ Contraseña: "password123"<br>• Producto:<br>    ○ ID: 99999 (inexistente)<br>• Reporte:<br>    ○ Tipo: "contenido_inapropiado"<br>    ○ Motivo: "Este es un motivo válido con más de veinte caracteres para cumplir con el requisito mínimo" |
| **Acciones** | • Autenticar usuario en el sistema<br>• Intentar crear reporte para producto con ID inexistente<br>    ○ Endpoint: POST /api/products/99999/report<br>    ○ Headers: Authorization: Bearer {token}<br>    ○ Body: {<br>      "tipo_reporte": "contenido_inapropiado",<br>      "motivo_reporte": "Este es un motivo válido con más de veinte caracteres para cumplir con el requisito mínimo"<br>    }<br>• Verificar que no se creó ningún reporte |
| **Resultados esperados** | • Status code: 404<br>• Mensaje: "Producto no encontrado"<br>• No se crea el reporte |
| **Criterios de aceptación** | • El sistema valida que el producto existe antes de crear el reporte<br>• Se muestra mensaje de error apropiado<br>• No se crea ningún registro en la base de datos |

---

## CP-005: Crear Reporte - Auto-Reporte (Comprador)

| Campo | Valor |
|-------|-------|
| **Id** | CP-005 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Validación Reporte |
| **Función por probar** | Al intentar que un comprador reporte su propio producto, el sistema rechaza la petición y muestra mensaje de error |
| **Prerrequisitos** | • El usuario comprador de prueba debe existir en la base de datos<br>• El usuario debe estar en estado "activo" y con email verificado<br>• Debe existir un producto activo que pertenezca al mismo usuario<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "comprador@test.com"<br>    ○ Contraseña: "password123"<br>• Producto:<br>    ○ ID de producto propio del usuario<br>• Reporte:<br>    ○ Tipo: "informacion_falsa"<br>    ○ Motivo: "Necesito corregir información del producto" |
| **Acciones** | • Autenticar usuario comprador en el sistema<br>• Obtener ID de un producto propio del usuario<br>• Enviar petición POST para crear reporte de producto propio<br>    ○ Endpoint: POST /api/products/:id/report<br>    ○ Headers: Authorization: Bearer {token}<br>    ○ Body: {<br>      "tipo_reporte": "informacion_falsa",<br>      "motivo_reporte": "Necesito corregir información del producto"<br>    }<br>• Verificar que no se creó ningún reporte<br>• Verificar que el producto no cambió de estado |
| **Resultados esperados** | • Status code: 400<br>• Mensaje: "No puedes reportar tu propio producto"<br>• El reporte NO se crea<br>• No se inserta registro en la tabla `reportes`<br>• El producto mantiene su estado original |
| **Criterios de aceptación** | • Los compradores no pueden reportar sus propios productos<br>• Se muestra mensaje de error claro<br>• No se crea ningún registro en la base de datos<br>• El producto no sufre cambios |

---

## CP-006: Crear Reporte - Reporte Duplicado

| Campo | Valor |
|-------|-------|
| **Id** | CP-006 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Validación Reporte |
| **Función por probar** | Al intentar que un usuario reporte el mismo producto dos veces, el sistema rechaza el segundo reporte y muestra mensaje de error |
| **Prerrequisitos** | • El usuario de prueba debe existir en la base de datos<br>• El usuario debe estar en estado "activo" y con email verificado<br>• Debe existir un producto activo en el sistema<br>• Ya existe un reporte del usuario para el mismo producto<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "comprador@test.com"<br>    ○ Contraseña: "password123"<br>• Producto:<br>    ○ ID de producto que ya fue reportado por este usuario<br>• Reporte:<br>    ○ Tipo: "spam"<br>    ○ Motivo: "Este producto es spam y debe ser eliminado" |
| **Acciones** | • Autenticar usuario en el sistema<br>• Crear primer reporte del producto (exitoso)<br>• Intentar crear segundo reporte del mismo producto<br>    ○ Endpoint: POST /api/products/:id/report<br>    ○ Headers: Authorization: Bearer {token}<br>    ○ Body: {<br>      "tipo_reporte": "spam",<br>      "motivo_reporte": "Segundo intento de reporte"<br>    }<br>• Verificar que solo existe un reporte en la base de datos<br>• Verificar que el reporte original no fue modificado |
| **Resultados esperados** | • Status code: 400<br>• Mensaje: "Ya has reportado este producto anteriormente"<br>• No se crea segundo reporte<br>• Existe solo un reporte del usuario para ese producto<br>• El reporte original mantiene sus datos y estado |
| **Criterios de aceptación** | • Un usuario no puede reportar el mismo producto dos veces<br>• Se muestra mensaje de error claro<br>• Solo existe un reporte del usuario para ese producto<br>• El reporte original no sufre cambios |

---

## CP-007: Crear Reporte - Moderador Reporta Producto

| Campo | Valor |
|-------|-------|
| **Id** | CP-007 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Crear Reporte |
| **Función por probar** | Al ingresar como un moderador autenticado, se puede crear un reporte de producto y el mensaje indica que será revisado por otro moderador o administrador |
| **Prerrequisitos** | • El usuario moderador de prueba debe existir en la base de datos con email moderador@test.com y contraseña password123<br>• El usuario debe estar en estado "activo" y con email verificado<br>• El usuario debe tener rol "moderador"<br>• Debe existir un producto activo en el sistema<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "moderador@test.com"<br>    ○ Contraseña: "password123"<br>• Producto:<br>    ○ ID de producto activo existente<br>• Reporte:<br>    ○ Tipo: "producto_prohibido"<br>    ○ Motivo: "Este producto está en la lista de productos prohibidos según las políticas de la plataforma"<br>    ○ Información adicional: "Ver categoría y descripción completa" |
| **Acciones** | • Autenticar usuario moderador en el sistema<br>• Obtener ID de un producto activo existente<br>• Enviar petición POST para crear reporte<br>    ○ Endpoint: POST /api/products/:id/report<br>    ○ Headers: Authorization: Bearer {token}<br>    ○ Body: {<br>      "tipo_reporte": "producto_prohibido",<br>      "motivo_reporte": "Este producto está en la lista de productos prohibidos según las políticas de la plataforma",<br>      "informacion_adicional": "Ver categoría y descripción completa"<br>    }<br>• Verificar en base de datos que el reporte fue creado<br>• Verificar mensaje diferenciado en respuesta |
| **Resultados esperados** | • Reporte creado exitosamente<br>• Status code: 201<br>• Mensaje: "Reporte creado exitosamente. Será revisado por otro moderador o administrador."<br>• El reporte queda en estado "pendiente"<br>• Se registra en la base de datos con usuario_reportador_id del moderador |
| **Criterios de aceptación** | • El reporte es creado con estado "pendiente"<br>• El mensaje diferencia que es un moderador quien reporta<br>• El mensaje indica que será revisado por "otro moderador o administrador"<br>• Los moderadores pueden reportar productos |

---

## CP-008: Ver Reportes Pendientes - Moderador

| Campo | Valor |
|-------|-------|
| **Id** | CP-008 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Ver Reportes |
| **Función por probar** | Al ingresar como un moderador autenticado, se puede ver la lista de reportes pendientes con información completa de cada reporte |
| **Prerrequisitos** | • El usuario moderador de prueba debe existir en la base de datos<br>• El usuario debe estar en estado "activo" y con email verificado<br>• El usuario debe tener rol "moderador" o "administrador"<br>• Existen reportes pendientes en el sistema<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "moderador@test.com"<br>    ○ Contraseña: "password123" |
| **Acciones** | • Autenticar usuario moderador en el sistema<br>• Asegurar que existen reportes pendientes en el sistema<br>• Enviar petición GET para listar reportes pendientes sin filtros<br>    ○ Endpoint: GET /api/reports/pending<br>    ○ Headers: Authorization: Bearer {token}<br>• Enviar petición GET con filtro por tipo de reporte<br>    ○ Endpoint: GET /api/reports/pending?tipo_reporte=contenido_inapropiado<br>• Enviar petición GET con filtro por estado<br>    ○ Endpoint: GET /api/reports/pending?estado=pendiente<br>• Enviar petición GET con ambos filtros<br>    ○ Endpoint: GET /api/reports/pending?tipo_reporte=producto_prohibido&estado=en_revision<br>• Verificar estructura de cada reporte en la respuesta |
| **Resultados esperados** | • Status code: 200<br>• Se muestra la lista de reportes con estado "pendiente" o "en_revision"<br>• Cada reporte muestra: información del producto (nombre, código, precio, tipo), información del reportante, tipo de reporte, motivo del reporte, fecha de reporte, estado actual<br>• Los filtros funcionan correctamente<br>• Solo se muestran reportes con estado "pendiente" o "en_revision"<br>• Ordenados por fecha_reporte ASC (más antiguos primero) |
| **Criterios de aceptación** | • El moderador puede ver la lista de reportes pendientes<br>• Cada reporte incluye información completa: id, item_id, tipo_reporte, descripcion, estado, producto_nombre, reportante_nombre, vendedor_nombre, total_reportes_producto<br>• Los filtros funcionan correctamente (tipo, estado, combinados)<br>• Solo se muestran reportes pendientes o en revisión |

---

## CP-009: Ver Reportes Pendientes - Sin Permisos

| Campo | Valor |
|-------|-------|
| **Id** | CP-009 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Permisos |
| **Función por probar** | Al intentar acceder a la lista de reportes pendientes como usuario sin permisos (comprador o vendedor), el sistema rechaza el acceso |
| **Prerrequisitos** | • El usuario comprador o vendedor de prueba debe existir en la base de datos<br>• El usuario debe estar en estado "activo" y con email verificado<br>• El usuario NO debe tener rol "moderador" o "administrador"<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "comprador@test.com" o "vendedor@test.com"<br>    ○ Contraseña: "password123" |
| **Acciones** | • Autenticar usuario comprador o vendedor en el sistema<br>• Intentar acceder a GET /api/reports/pending<br>    ○ Endpoint: GET /api/reports/pending<br>    ○ Headers: Authorization: Bearer {token} |
| **Resultados esperados** | • Status code: 403<br>• Mensaje de acceso denegado<br>• No se muestran reportes |
| **Criterios de aceptación** | • El middleware `requireProductModerate` bloquea el acceso<br>• Solo usuarios con rol moderador o administrador pueden acceder<br>• Se muestra mensaje de error apropiado |

---

## CP-010: Filtrar Reportes por Tipo

| Campo | Valor |
|-------|-------|
| **Id** | CP-010 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Filtros |
| **Función por probar** | Al aplicar filtro por tipo de reporte, el sistema muestra solo los reportes que coinciden con el tipo seleccionado |
| **Prerrequisitos** | • El usuario moderador de prueba debe existir en la base de datos<br>• El usuario debe estar en estado "activo" y con email verificado<br>• El usuario debe tener rol "moderador"<br>• Existen reportes de diferentes tipos en el sistema<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "moderador@test.com"<br>    ○ Contraseña: "password123"<br>• Filtro:<br>    ○ Tipo de reporte: "contenido_inapropiado" |
| **Acciones** | • Autenticar usuario moderador en el sistema<br>• Acceder a gestión de reportes<br>• Enviar petición GET con filtro por tipo<br>    ○ Endpoint: GET /api/reports/pending?tipo_reporte=contenido_inapropiado<br>    ○ Headers: Authorization: Bearer {token}<br>• Verificar que solo se muestran reportes del tipo especificado |
| **Resultados esperados** | • Status code: 200<br>• Solo se muestran reportes de tipo "contenido_inapropiado"<br>• Los demás reportes se ocultan<br>• El contador se actualiza |
| **Criterios de aceptación** | • Query parameter `tipo_reporte` se envía correctamente<br>• Backend filtra correctamente por tipo<br>• Solo se muestran reportes del tipo especificado |

---

## CP-011: Filtrar Reportes por Estado

| Campo | Valor |
|-------|-------|
| **Id** | CP-011 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Filtros |
| **Función por probar** | Al aplicar filtro por estado, el sistema muestra solo los reportes que coinciden con el estado seleccionado |
| **Prerrequisitos** | • El usuario moderador de prueba debe existir en la base de datos<br>• El usuario debe estar en estado "activo" y con email verificado<br>• El usuario debe tener rol "moderador"<br>• Existen reportes en diferentes estados en el sistema<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "moderador@test.com"<br>    ○ Contraseña: "password123"<br>• Filtro:<br>    ○ Estado: "pendiente" |
| **Acciones** | • Autenticar usuario moderador en el sistema<br>• Acceder a gestión de reportes<br>• Enviar petición GET con filtro por estado<br>    ○ Endpoint: GET /api/reports/pending?estado=pendiente<br>    ○ Headers: Authorization: Bearer {token}<br>• Enviar petición GET con ambos filtros (tipo + estado)<br>    ○ Endpoint: GET /api/reports/pending?tipo_reporte=producto_prohibido&estado=en_revision<br>• Verificar que solo se muestran reportes del estado especificado |
| **Resultados esperados** | • Status code: 200<br>• Solo se muestran reportes con estado "pendiente"<br>• Los demás reportes se ocultan<br>• La combinación de filtros funciona correctamente |
| **Criterios de aceptación** | • Query parameter `estado` se envía correctamente<br>• Backend filtra correctamente por estado<br>• Combinación de filtros funciona (tipo + estado)<br>• Solo se muestran reportes del estado especificado |

---

## CP-012: Resolver Reporte - Aprobar (Producto Válido)

| Campo | Valor |
|-------|-------|
| **Id** | CP-012 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Resolver Reporte |
| **Función por probar** | Al ingresar como un moderador autenticado, se puede aprobar un reporte indicando que el producto es válido, el reporte se marca como resuelto y el producto mantiene estado activo |
| **Prerrequisitos** | • El usuario moderador de prueba debe existir en la base de datos<br>• El usuario debe estar en estado "activo" y con email verificado<br>• El usuario debe tener rol "moderador"<br>• Existe un reporte en estado "pendiente"<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "moderador@test.com"<br>    ○ Contraseña: "password123"<br>• Reporte:<br>    ○ ID de reporte en estado "pendiente"<br>• Resolución:<br>    ○ Acción: "aprobar"<br>    ○ Decisión final: "Tras revisar el producto, se confirma que cumple con todas las políticas de la plataforma. El reporte era infundado." |
| **Acciones** | • Autenticar usuario moderador en el sistema<br>• Obtener ID de un reporte en estado pendiente<br>• Enviar petición PATCH para resolver reporte aprobando el producto<br>    ○ Endpoint: PATCH /api/reports/:id/resolve<br>    ○ Headers: Authorization: Bearer {token}, Content-Type: application/json<br>    ○ Body: {<br>      "accion": "aprobar",<br>      "decision_final": "Tras revisar el producto, se confirma que cumple con todas las políticas de la plataforma. El reporte era infundado."<br>    }<br>• Verificar en base de datos que el reporte fue actualizado<br>• Verificar que el producto fue actualizado<br>• Verificar que no se marcó como peligroso |
| **Resultados esperados** | • Status code: 200<br>• El reporte cambia a estado "resuelto"<br>• El producto mantiene estado "activo"<br>• Se registra `moderador_resolutor_id`<br>• Se guarda `decision_final` y `fecha_resolucion`<br>• Mensaje: "Reporte procesado exitosamente. Producto: activo" |
| **Criterios de aceptación** | • Estado del reporte: "resuelto"<br>• Estado del producto: "activo"<br>• Campo `decision_final` contiene la explicación<br>• Campo `moderador_resolutor_id` = ID del moderador<br>• Campo `fecha_resolucion` actualizada<br>• Campo `es_peligroso` = false |

---

## CP-013: Resolver Reporte - Rechazar Producto

| Campo | Valor |
|-------|-------|
| **Id** | CP-013 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Resolver Reporte |
| **Función por probar** | Al ingresar como un moderador autenticado, se puede rechazar un producto mediante reporte, el reporte se marca como resuelto y el producto cambia a estado rechazado |
| **Prerrequisitos** | • El usuario moderador de prueba debe existir en la base de datos<br>• El usuario debe estar en estado "activo" y con email verificado<br>• El usuario debe tener rol "moderador"<br>• Existe un reporte en estado "pendiente"<br>• El producto está en estado "activo"<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "moderador@test.com"<br>    ○ Contraseña: "password123"<br>• Reporte:<br>    ○ ID de reporte en estado "pendiente"<br>• Resolución:<br>    ○ Acción: "rechazar"<br>    ○ Decisión final: "El producto viola las políticas de contenido. Se rechaza por contener información falsa sobre las características del producto."<br>    ○ Marcar peligroso: false |
| **Acciones** | • Autenticar usuario moderador en el sistema<br>• Obtener ID de un reporte en estado pendiente<br>• Enviar petición PATCH para resolver reporte rechazando el producto<br>    ○ Endpoint: PATCH /api/reports/:id/resolve<br>    ○ Headers: Authorization: Bearer {token}, Content-Type: application/json<br>    ○ Body: {<br>      "accion": "rechazar",<br>      "decision_final": "El producto viola las políticas de contenido. Se rechaza por contener información falsa sobre las características del producto.",<br>      "marcar_peligroso": false<br>    }<br>• Verificar en base de datos que el reporte fue actualizado<br>• Verificar que el producto fue rechazado<br>• Verificar que el producto no está marcado como peligroso |
| **Resultados esperados** | • Status code: 200<br>• Reporte estado: "resuelto"<br>• Producto estado: "rechazado"<br>• Se guarda motivo de rechazo<br>• Campo `es_peligroso` = false |
| **Criterios de aceptación** | • Estado del reporte: "resuelto"<br>• Estado del producto: "rechazado"<br>• Campo `motivo_rechazo` actualizado en items<br>• Campo `moderador_revision_id` actualizado<br>• Campo `es_peligroso` = false |

---

## CP-014: Resolver Reporte - Suspender Producto

| Campo | Valor |
|-------|-------|
| **Id** | CP-014 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Resolver Reporte |
| **Función por probar** | Al ingresar como un moderador autenticado, se puede suspender un producto mediante reporte, el reporte se marca como resuelto y el producto cambia a estado suspendido |
| **Prerrequisitos** | • El usuario moderador de prueba debe existir en la base de datos<br>• El usuario debe estar en estado "activo" y con email verificado<br>• El usuario debe tener rol "moderador"<br>• Existe un reporte en estado "pendiente"<br>• El producto está en estado "activo"<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "moderador@test.com"<br>    ○ Contraseña: "password123"<br>• Reporte:<br>    ○ ID de reporte en estado "pendiente"<br>• Resolución:<br>    ○ Acción: "suspender"<br>    ○ Decisión final: "Producto suspendido temporalmente para revisión. Se requiere más información del vendedor."<br>    ○ Marcar peligroso: false |
| **Acciones** | • Autenticar usuario moderador en el sistema<br>• Obtener ID de un reporte en estado pendiente<br>• Enviar petición PATCH para resolver reporte suspendiendo el producto<br>    ○ Endpoint: PATCH /api/reports/:id/resolve<br>    ○ Headers: Authorization: Bearer {token}, Content-Type: application/json<br>    ○ Body: {<br>      "accion": "suspender",<br>      "decision_final": "Producto suspendido temporalmente para revisión. Se requiere más información del vendedor.",<br>      "marcar_peligroso": false<br>    }<br>• Verificar en base de datos que el reporte fue actualizado<br>• Verificar que el producto fue suspendido<br>• Verificar que el producto puede ser apelado |
| **Resultados esperados** | • Status code: 200<br>• Reporte estado: "resuelto"<br>• Producto estado: "suspendido"<br>• Producto no visible en búsquedas<br>• Producto puede ser apelado |
| **Criterios de aceptación** | • Estado del reporte: "resuelto"<br>• Estado del producto: "suspendido"<br>• Campo `moderador_revision_id` actualizado<br>• Campo `fecha_revision` actualizada<br>• Producto oculto de catálogo público<br>• Producto puede ser apelado (estado = "suspendido") |

---

## CP-015: Resolver Reporte - Marcar como Peligroso

| Campo | Valor |
|-------|-------|
| **Id** | CP-015 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Resolver Reporte |
| **Función por probar** | Al ingresar como un moderador autenticado, se puede marcar un producto como peligroso mediante reporte, el reporte se marca como resuelto, el producto cambia a estado peligroso y no puede ser apelado |
| **Prerrequisitos** | • El usuario moderador de prueba debe existir en la base de datos<br>• El usuario debe estar en estado "activo" y con email verificado<br>• El usuario debe tener rol "moderador"<br>• Existe un reporte en estado "pendiente"<br>• El producto está en estado "activo"<br>• Vendedor tiene otros productos peligrosos (para probar bloqueo automático)<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "moderador@test.com"<br>    ○ Contraseña: "password123"<br>• Reporte:<br>    ○ ID de reporte en estado "pendiente"<br>• Resolución:<br>    ○ Acción: "eliminar"<br>    ○ Decisión final: "Producto prohibido que puede causar daño a los usuarios. Contiene sustancias ilegales."<br>    ○ Marcar peligroso: true |
| **Acciones** | • Autenticar usuario moderador en el sistema<br>• Obtener ID de un reporte en estado pendiente<br>• Enviar petición PATCH para resolver reporte marcando como peligroso<br>    ○ Endpoint: PATCH /api/reports/:id/resolve<br>    ○ Headers: Authorization: Bearer {token}, Content-Type: application/json<br>    ○ Body: {<br>      "accion": "eliminar",<br>      "decision_final": "Producto prohibido que puede causar daño a los usuarios. Contiene sustancias ilegales.",<br>      "marcar_peligroso": true<br>    }<br>• Verificar en base de datos que el reporte fue actualizado<br>• Verificar que el producto fue marcado como peligroso<br>• Verificar que productos peligrosos no pueden apelarse<br>• Verificar bloqueo automático de cuenta (si aplica) |
| **Resultados esperados** | • Status code: 200<br>• Reporte estado: "resuelto"<br>• Producto estado: "peligroso"<br>• Campo `es_peligroso` = true<br>• Campo `fecha_deteccion_peligroso` = CURRENT_TIMESTAMP<br>• Si el vendedor tiene 3+ productos peligrosos, su cuenta se bloquea automáticamente<br>• Producto oculto permanentemente |
| **Criterios de aceptación** | • Estado del reporte: "resuelto"<br>• Estado del producto: "peligroso"<br>• Campo `es_peligroso` = true<br>• Campo `fecha_deteccion_peligroso` actualizada<br>• Producto oculto permanentemente<br>• Productos peligrosos no pueden apelarse<br>• Verificar bloqueo automático de cuenta (si aplica) |

---

## CP-016: Resolver Reporte - Validación Explicación Mínima

| Campo | Valor |
|-------|-------|
| **Id** | CP-016 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Validación Resolución |
| **Función por probar** | Al intentar resolver un reporte con explicación menor a 10 caracteres, el sistema rechaza la petición y muestra mensaje de error |
| **Prerrequisitos** | • El usuario moderador de prueba debe existir en la base de datos<br>• El usuario debe estar en estado "activo" y con email verificado<br>• El usuario debe tener rol "moderador"<br>• Existe un reporte en estado "pendiente"<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "moderador@test.com"<br>    ○ Contraseña: "password123"<br>• Reporte:<br>    ○ ID de reporte en estado "pendiente"<br>• Resolución:<br>    ○ Acción: "aprobar"<br>    ○ Decisión final: "OK" (menos de 10 caracteres) |
| **Acciones** | • Autenticar usuario moderador en el sistema<br>• Obtener ID de un reporte en estado pendiente<br>• Seleccionar acción de resolución<br>• Enviar petición PATCH con explicación inválida<br>    ○ Endpoint: PATCH /api/reports/:id/resolve<br>    ○ Headers: Authorization: Bearer {token}, Content-Type: application/json<br>    ○ Body: {<br>      "accion": "aprobar",<br>      "decision_final": "OK"<br>    }<br>• Verificar que la acción NO se ejecuta |
| **Resultados esperados** | • Frontend: Muestra error "La explicación debe tener al menos 10 caracteres"<br>• Backend: Status code 400<br>• Mensaje: "Debes proporcionar una explicación de al menos 10 caracteres"<br>• La acción NO se ejecuta |
| **Criterios de aceptación** | • Validación en frontend y backend<br>• Botón confirmar deshabilitado hasta cumplir requisito<br>• Se muestra mensaje de error claro<br>• El reporte no se modifica |

---

## CP-017: Resolver Reporte - Reporte Ya Resuelto

| Campo | Valor |
|-------|-------|
| **Id** | CP-017 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Validación Resolución |
| **Función por probar** | Al intentar resolver un reporte que ya fue procesado, el sistema rechaza la petición y muestra mensaje de error |
| **Prerrequisitos** | • El usuario moderador de prueba debe existir en la base de datos<br>• El usuario debe estar en estado "activo" y con email verificado<br>• El usuario debe tener rol "moderador"<br>• Existe un reporte en estado "resuelto"<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "moderador@test.com"<br>    ○ Contraseña: "password123"<br>• Reporte:<br>    ○ ID de reporte en estado "resuelto"<br>• Resolución:<br>    ○ Acción: "aprobar"<br>    ○ Decisión final: "Tras revisar el producto, se confirma que cumple con todas las políticas de la plataforma." |
| **Acciones** | • Autenticar usuario moderador en el sistema<br>• Obtener ID de un reporte en estado "resuelto"<br>• Intentar resolver reporte ya resuelto<br>    ○ Endpoint: PATCH /api/reports/:id/resolve<br>    ○ Headers: Authorization: Bearer {token}, Content-Type: application/json<br>    ○ Body: {<br>      "accion": "aprobar",<br>      "decision_final": "Tras revisar el producto, se confirma que cumple con todas las políticas de la plataforma."<br>    }<br>• Verificar que no se modifica el reporte ni el producto |
| **Resultados esperados** | • Status code: 400<br>• Mensaje: "Este reporte ya fue resuelto"<br>• No se modifica el reporte ni el producto |
| **Criterios de aceptación** | • Solo reportes "pendiente" o "en_revision" pueden resolverse<br>• Se muestra mensaje de error claro<br>• El reporte no sufre cambios<br>• El producto no sufre cambios |

---

## CP-018: Ver Mis Reportes - Usuario

| Campo | Valor |
|-------|-------|
| **Id** | CP-018 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Ver Reportes |
| **Función por probar** | Al ingresar como un usuario autenticado, se puede ver la lista de sus propios reportes con información completa |
| **Prerrequisitos** | • El usuario de prueba debe existir en la base de datos (cualquier tipo)<br>• El usuario debe estar en estado "activo" y con email verificado<br>• El usuario tiene reportes creados<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "comprador@test.com"<br>    ○ Contraseña: "password123" |
| **Acciones** | • Autenticar usuario en el sistema<br>• Asegurar que el usuario tiene reportes creados<br>• Enviar petición GET para ver reportes del usuario<br>    ○ Endpoint: GET /api/reports/my/reports<br>    ○ Headers: Authorization: Bearer {token}<br>• Verificar que solo se muestran reportes del usuario actual |
| **Resultados esperados** | • Status code: 200<br>• Se muestran solo los reportes del usuario actual<br>• Cada reporte muestra: producto reportado, tipo de reporte, estado del reporte, información del revisor (si fue resuelto), fecha de reporte |
| **Criterios de aceptación** | • Solo reportes del usuario autenticado<br>• Ordenados por fecha_reporte DESC (más recientes primero)<br>• Cada reporte incluye información completa<br>• No se muestran reportes de otros usuarios |

---

## CP-019: Ver Reportes de Producto - Propietario

| Campo | Valor |
|-------|-------|
| **Id** | CP-019 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Ver Reportes |
| **Función por probar** | Al ingresar como el propietario de un producto autenticado, se puede ver todos los reportes de su producto |
| **Prerrequisitos** | • El usuario vendedor de prueba debe existir en la base de datos<br>• El usuario debe estar en estado "activo" y con email verificado<br>• El vendedor tiene un producto con reportes<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "vendedor@test.com"<br>    ○ Contraseña: "password123"<br>• Producto:<br>    ○ ID de producto del vendedor que tiene reportes |
| **Acciones** | • Autenticar usuario vendedor en el sistema<br>• Obtener ID de un producto propio que tiene reportes<br>• Enviar petición GET para ver reportes del producto<br>    ○ Endpoint: GET /api/products/:id/reports<br>    ○ Headers: Authorization: Bearer {token}<br>• Verificar que se muestran todos los reportes del producto |
| **Resultados esperados** | • Status code: 200<br>• Se muestran todos los reportes del producto<br>• Información completa de cada reporte |
| **Criterios de aceptación** | • Solo propietario del producto o moderadores/administradores pueden ver<br>• Usuario sin permisos recibe 403<br>• Se muestran todos los reportes del producto<br>• Cada reporte incluye información completa |

---

## CP-020: Estadísticas de Reportes

| Campo | Valor |
|-------|-------|
| **Id** | CP-020 |
| **Módulo** | Moderación/Reportes |
| **Submódulo** | Estadísticas |
| **Función por probar** | Al ingresar como un moderador autenticado, se pueden ver las estadísticas de reportes calculadas correctamente |
| **Prerrequisitos** | • El usuario moderador de prueba debe existir en la base de datos<br>• El usuario debe estar en estado "activo" y con email verificado<br>• El usuario debe tener rol "moderador"<br>• Existen reportes en diferentes estados y tipos en el sistema<br>• La aplicación debe estar ejecutándose y accesible |
| **Datos de entrada** | • Usuario:<br>    ○ Email: "moderador@test.com"<br>    ○ Contraseña: "password123" |
| **Acciones** | • Autenticar usuario moderador en el sistema<br>• Asegurar que existen reportes en diferentes estados y tipos<br>• Enviar petición GET para ver estadísticas<br>    ○ Endpoint: GET /api/reports/statistics<br>    ○ Headers: Authorization: Bearer {token}<br>• Verificar que las estadísticas se calculan correctamente |
| **Resultados esperados** | • Status code: 200<br>• Se muestran las siguientes estadísticas: total de reportes, reportes pendientes, reportes en revisión, reportes resueltos, reportes por tipo (contenido_inapropiado, producto_prohibido, informacion_falsa, spam) |
| **Criterios de aceptación** | • Los conteos son correctos<br>• Las estadísticas se actualizan en tiempo real<br>• Solo usuarios con permisos pueden acceder<br>• Las estadísticas incluyen todos los datos relevantes |

---

**Fecha de Creación:** [Fecha Actual]  
**Versión del Sistema:** [Versión]  
**Autor:** Sistema de Pruebas

