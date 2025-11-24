# Preparación de Datos de Prueba para E2E

## ⚠️ IMPORTANTE

Los tests E2E requieren que existan usuarios de prueba en la base de datos con las credenciales exactas especificadas en `.env`.

## Usuarios Requeridos

Debes crear los siguientes usuarios en tu base de datos:

### 1. Usuario Comprador
- **Email:** `comprador@test.com`
- **Contraseña:** `password123`
- **Rol:** `comprador`
- **Estado:** `activo`
- **Email verificado:** `true` (1)
- **Cédula:** Cualquier cédula válida (ej: `1234567890`)

### 2. Usuario Vendedor
- **Email:** `vendedor@test.com`
- **Contraseña:** `password123`
- **Rol:** `vendedor`
- **Estado:** `activo`
- **Email verificado:** `true` (1)
- **Cédula:** Cualquier cédula válida (ej: `0987654321`)

### 3. Usuario Moderador
- **Email:** `moderador@test.com`
- **Contraseña:** `password123`
- **Rol:** `moderador`
- **Estado:** `activo`
- **Email verificado:** `true` (1)
- **Cédula:** Cualquier cédula válida (ej: `1122334455`)

### 4. Usuario Administrador
- **Email:** `admin@test.com`
- **Contraseña:** `password123`
- **Rol:** `administrador`
- **Estado:** `activo`
- **Email verificado:** `true` (1)
- **Cédula:** Cualquier cédula válida (ej: `5566778899`)

### 5. Usuario Suspendido (opcional, para tests específicos)
- **Email:** `suspended@test.com`
- **Contraseña:** `password123`
- **Rol:** `comprador`
- **Estado:** `suspendido`
- **Email verificado:** `true` (1)

## Métodos para Crear Usuarios de Prueba

### Opción 1: Script Node.js (Recomendado)

Ejecuta el script desde la carpeta `backend/`:

```bash
cd backend
node create-e2e-test-users.js
```

O en Windows:
```bash
cd backend
create-e2e-test-users.bat
```

Este script:
- ✅ Genera el hash bcrypt automáticamente
- ✅ Verifica si los usuarios ya existen y los actualiza
- ✅ Muestra un resumen de los usuarios creados
- ✅ Maneja errores automáticamente

### Opción 2: Script SQL Directo

Si prefieres ejecutar SQL directamente, usa el archivo `backend/create-e2e-test-users.sql`:

1. Abre tu cliente de PostgreSQL (pgAdmin, DBeaver, etc.)
2. Ejecuta el contenido del archivo `create-e2e-test-users.sql`
3. Verifica que los usuarios se hayan creado correctamente

**Nota:** El hash bcrypt usado es: `$2b$10$w5n3al7idardeQAOMfhkzu5MIjvUcGmUeqZf36wovTZKuxlVVtH5C` (para la contraseña `password123`)

## Verificación

Antes de ejecutar los tests, verifica que:

1. ✅ El backend esté corriendo en `http://localhost:3001`
2. ✅ El frontend esté corriendo en `http://localhost:5173`
3. ✅ Los usuarios de prueba existan en la BD
4. ✅ Puedas hacer login manualmente con `comprador@test.com` / `password123`
5. ✅ Las variables de entorno en `.env` estén configuradas correctamente

## Solución de Problemas

### Error: "Login timeout - no se redirigió después del login"
- **Causa:** El usuario no existe o las credenciales son incorrectas
- **Solución:** Verifica que el usuario exista en la BD y que la contraseña sea `password123`

### Error: "Element not found"
- **Causa:** Los selectores no encuentran los elementos
- **Solución:** Verifica que la UI no haya cambiado. Los selectores están diseñados para ser flexibles, pero pueden necesitar ajustes.

### Error: "Test timeout"
- **Causa:** La aplicación tarda mucho en responder
- **Solución:** Aumenta los timeouts en `playwright.config.ts` o verifica que el servidor esté respondiendo correctamente.

## Notas

- Los tests generan emails y cédulas únicos para evitar conflictos en tests de registro
- Algunos tests están marcados como `skip` porque requieren códigos reales de verificación
- Los tests de gestión de usuarios requieren que el usuario administrador exista y pueda hacer login

