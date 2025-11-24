/**
 * Pruebas de Integración - Módulo de Moderación y Reportes
 * Implementa los 12 casos de prueba definidos en PRUEBAS_INTEGRACION_MODERACION_REPORTES.md
 */

const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../src/app');
const { query } = require('../../../src/config/database');
const { 
  cleanAuthTables, 
  cleanModerationTables
} = require('../../helpers/db.helpers');
const { 
  createTestBuyer,
  createTestSeller,
  createTestModerator,
  getAuthHeaders
} = require('../../helpers/auth.helpers');

describe('Módulo de Moderación y Reportes', () => {
  
  let compradorUser, vendedorUser, moderadorUser;
  let productos = {};

  beforeEach(async () => {
    await cleanAuthTables();
    await cleanModerationTables();

    // Crear usuarios de prueba
    compradorUser = await createTestBuyer({
      correo: 'comprador@test.com',
      password: 'password123'
    });

    vendedorUser = await createTestSeller({
      correo: 'vendedor@test.com',
      password: 'password123'
    });

    moderadorUser = await createTestModerator({
      correo: 'moderador@test.com',
      password: 'password123'
    });

    // Obtener una categoría existente
    const categoriaResult = await query('SELECT id FROM categorias LIMIT 1');
    if (categoriaResult.rows.length === 0) {
      throw new Error('No hay categorías en la base de datos. Ejecuta los scripts de inicialización.');
    }
    const categoriaId = categoriaResult.rows[0].id;

    // Crear productos de prueba
    const timestamp = Date.now();
    const productoActivoResult = await query(`
      INSERT INTO items (
        codigo, nombre, descripcion, precio, tipo, estado, vendedor_id, categoria_id, disponibilidad
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      `TEST-ACT-${timestamp}`,
      'TEST_Producto Activo',
      'Descripción del producto activo para pruebas',
      100.00,
      'producto',
      'activo',
      vendedorUser.id,
      categoriaId,
      true
    ]);
    productos.activo = productoActivoResult.rows[0];

    const productoPropioResult = await query(`
      INSERT INTO items (
        codigo, nombre, descripcion, precio, tipo, estado, vendedor_id, categoria_id, disponibilidad
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      `TEST-PROP-${timestamp}`,
      'TEST_Producto Propio Comprador',
      'Producto del comprador para prueba',
      50.00,
      'producto',
      'activo',
      compradorUser.id,
      categoriaId,
      true
    ]);
    productos.propio = productoPropioResult.rows[0];

    const productoRechazadoResult = await query(`
      INSERT INTO items (
        codigo, nombre, descripcion, precio, tipo, estado, vendedor_id, categoria_id, disponibilidad, motivo_rechazo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      `TEST-REJ-${timestamp}`,
      'TEST_Producto Rechazado',
      'Producto rechazado para pruebas de apelación',
      75.00,
      'producto',
      'rechazado',
      vendedorUser.id,
      categoriaId,
      false,
      'Producto rechazado por pruebas'
    ]);
    productos.rechazado = productoRechazadoResult.rows[0];

    const productoSuspendidoResult = await query(`
      INSERT INTO items (
        codigo, nombre, descripcion, precio, tipo, estado, vendedor_id, categoria_id, disponibilidad
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      `TEST-SUSP-${timestamp}`,
      'TEST_Producto Suspendido',
      'Producto suspendido para pruebas de apelación',
      80.00,
      'producto',
      'suspendido',
      vendedorUser.id,
      categoriaId,
      false
    ]);
    productos.suspendido = productoSuspendidoResult.rows[0];
  });

  describe('CP-001: Crear Reporte (Comprador)', () => {
    it('debe permitir a un comprador crear un reporte de producto con datos válidos', async () => {
      const res = await request(app)
        .post(`/api/products/${productos.activo.id}/report`)
        .set(getAuthHeaders(compradorUser.token))
        .send({
          tipo_reporte: 'contenido_inapropiado',
          motivo_reporte: 'El producto contiene imágenes inapropiadas que violan las políticas',
          informacion_adicional: 'Sección de imágenes, tercera foto'
        })
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('estado', 'pendiente');
      expect(res.body.data).to.have.property('tipo_reporte', 'contenido_inapropiado');

      // Verificar en base de datos
      const reporteResult = await query(
        'SELECT * FROM reportes WHERE item_id = $1 AND usuario_reportador_id = $2',
        [productos.activo.id, compradorUser.id]
      );
      expect(reporteResult.rows.length).to.equal(1);
      expect(reporteResult.rows[0].estado).to.equal('pendiente');

      // Verificar que el producto mantiene su estado
      const productoResult = await query('SELECT estado FROM items WHERE id = $1', [productos.activo.id]);
      expect(productoResult.rows[0].estado).to.equal('activo');
    });
  });

  describe('CP-002: Crear Reporte (Moderador)', () => {
    it('debe permitir a un moderador crear un reporte de producto', async () => {
      const res = await request(app)
        .post(`/api/products/${productos.activo.id}/report`)
        .set(getAuthHeaders(moderadorUser.token))
        .send({
          tipo_reporte: 'producto_prohibido',
          motivo_reporte: 'Este producto está en la lista de productos prohibidos según las políticas de la plataforma',
          informacion_adicional: 'Ver categoría y descripción completa'
        })
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('otro moderador o administrador');
      expect(res.body.data).to.have.property('estado', 'pendiente');
    });
  });

  describe('CP-003: Validación Reporte Propio', () => {
    it('debe rechazar que un comprador reporte su propio producto', async () => {
      const res = await request(app)
        .post(`/api/products/${productos.propio.id}/report`)
        .set(getAuthHeaders(compradorUser.token))
        .send({
          tipo_reporte: 'informacion_falsa',
          motivo_reporte: 'Necesito corregir información del producto'
        })
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('No puedes reportar tu propio producto');

      // Verificar que no se creó ningún reporte
      const reportesResult = await query(
        'SELECT * FROM reportes WHERE item_id = $1 AND usuario_reportador_id = $2',
        [productos.propio.id, compradorUser.id]
      );
      expect(reportesResult.rows.length).to.equal(0);
    });
  });

  describe('CP-004: Validación Reporte Duplicado', () => {
    it('debe rechazar crear un reporte duplicado del mismo usuario para el mismo producto', async () => {
      // Crear primer reporte
      await request(app)
        .post(`/api/products/${productos.activo.id}/report`)
        .set(getAuthHeaders(compradorUser.token))
        .send({
          tipo_reporte: 'spam',
          motivo_reporte: 'Este producto es spam y debe ser eliminado'
        })
        .expect(201);

      // Intentar crear segundo reporte
      const res = await request(app)
        .post(`/api/products/${productos.activo.id}/report`)
        .set(getAuthHeaders(compradorUser.token))
        .send({
          tipo_reporte: 'spam',
          motivo_reporte: 'Segundo intento de reporte'
        })
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('Ya has reportado este producto anteriormente');

      // Verificar que solo existe un reporte
      const reportesResult = await query(
        'SELECT * FROM reportes WHERE item_id = $1 AND usuario_reportador_id = $2',
        [productos.activo.id, compradorUser.id]
      );
      expect(reportesResult.rows.length).to.equal(1);
    });
  });

  describe('CP-005: Listar Reportes Pendientes', () => {
    it('debe permitir a un moderador ver la lista de reportes pendientes con filtros', async () => {
      // Crear varios reportes
      await request(app)
        .post(`/api/products/${productos.activo.id}/report`)
        .set(getAuthHeaders(compradorUser.token))
        .send({
          tipo_reporte: 'contenido_inapropiado',
          motivo_reporte: 'Este es un reporte pendiente número uno que contiene contenido inapropiado'
        })
        .expect(201);

      await request(app)
        .post(`/api/products/${productos.activo.id}/report`)
        .set(getAuthHeaders(vendedorUser.token))
        .send({
          tipo_reporte: 'producto_prohibido',
          motivo_reporte: 'Este es un reporte en revisión que indica que el producto está prohibido'
        })
        .expect(201);

      // Listar todos los pendientes
      const res1 = await request(app)
        .get('/api/reports/pending')
        .set(getAuthHeaders(moderadorUser.token))
        .expect(200);

      expect(res1.body).to.have.property('success', true);
      expect(res1.body.data).to.be.an('array');
      expect(res1.body.data.length).to.be.at.least(2);

      // Filtrar por tipo
      const res2 = await request(app)
        .get('/api/reports/pending?tipo_reporte=contenido_inapropiado')
        .set(getAuthHeaders(moderadorUser.token))
        .expect(200);

      expect(res2.body.success).to.be.true;
      res2.body.data.forEach(reporte => {
        expect(reporte.tipo_reporte).to.equal('contenido_inapropiado');
      });

      // Filtrar por estado
      const res3 = await request(app)
        .get('/api/reports/pending?estado=pendiente')
        .set(getAuthHeaders(moderadorUser.token))
        .expect(200);

      expect(res3.body.success).to.be.true;
      res3.body.data.forEach(reporte => {
        expect(['pendiente', 'en_revision']).to.include(reporte.estado);
      });
    });
  });

  describe('CP-006: Resolver Reporte - Aprobar', () => {
    it('debe permitir a un moderador aprobar un reporte (producto válido)', async () => {
      // Crear reporte
      const reportRes = await request(app)
        .post(`/api/products/${productos.activo.id}/report`)
        .set(getAuthHeaders(compradorUser.token))
        .send({
          tipo_reporte: 'informacion_falsa',
          motivo_reporte: 'Reporte para aprobar'
        })
        .expect(201);

      const reporteId = reportRes.body.data.id;

      // Resolver reporte aprobando
      const res = await request(app)
        .patch(`/api/reports/${reporteId}/resolve`)
        .set(getAuthHeaders(moderadorUser.token))
        .send({
          accion: 'aprobar',
          decision_final: 'Tras revisar el producto, se confirma que cumple con todas las políticas de la plataforma. El reporte era infundado.'
        })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('activo');

      // Verificar reporte actualizado
      const reporteResult = await query('SELECT * FROM reportes WHERE id = $1', [reporteId]);
      expect(reporteResult.rows[0].estado).to.equal('resuelto');
      expect(reporteResult.rows[0].moderador_resolutor_id).to.equal(moderadorUser.id);

      // Verificar producto
      const productoResult = await query('SELECT * FROM items WHERE id = $1', [productos.activo.id]);
      expect(productoResult.rows[0].estado).to.equal('activo');
      expect(productoResult.rows[0].es_peligroso).to.be.false;
    });
  });

  describe('CP-007: Resolver Reporte - Rechazar', () => {
    it('debe permitir a un moderador rechazar un producto mediante reporte', async () => {
      // Crear nuevo producto para esta prueba
      const categoriaResult = await query('SELECT id FROM categorias LIMIT 1');
      const timestamp = Date.now();
      const productoResult = await query(`
        INSERT INTO items (
          codigo, nombre, descripcion, precio, tipo, estado, vendedor_id, categoria_id, disponibilidad
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        `TEST-REJ2-${timestamp}`,
        'TEST_Producto Para Rechazar',
        'Producto para rechazar',
        90.00,
        'producto',
        'activo',
        vendedorUser.id,
        categoriaResult.rows[0].id,
        true
      ]);
      const producto = productoResult.rows[0];

      // Crear reporte
      const reportRes = await request(app)
        .post(`/api/products/${producto.id}/report`)
        .set(getAuthHeaders(compradorUser.token))
        .send({
          tipo_reporte: 'contenido_inapropiado',
          motivo_reporte: 'Reporte para rechazar'
        })
        .expect(201);

      const reporteId = reportRes.body.data.id;

      // Resolver reporte rechazando
      const res = await request(app)
        .patch(`/api/reports/${reporteId}/resolve`)
        .set(getAuthHeaders(moderadorUser.token))
        .send({
          accion: 'rechazar',
          decision_final: 'El producto viola las políticas de contenido. Se rechaza por contener información falsa sobre las características del producto.',
          marcar_peligroso: false
        })
        .expect(200);

      expect(res.body).to.have.property('success', true);

      // Verificar producto rechazado
      const productoActualizado = await query('SELECT * FROM items WHERE id = $1', [producto.id]);
      expect(productoActualizado.rows[0].estado).to.equal('rechazado');
      expect(productoActualizado.rows[0].es_peligroso).to.be.false;
    });
  });

  describe('CP-008: Resolver Reporte - Suspender', () => {
    it('debe permitir a un moderador suspender un producto mediante reporte', async () => {
      // Crear nuevo producto
      const categoriaResult = await query('SELECT id FROM categorias LIMIT 1');
      const timestamp = Date.now();
      const productoResult = await query(`
        INSERT INTO items (
          codigo, nombre, descripcion, precio, tipo, estado, vendedor_id, categoria_id, disponibilidad
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        `TEST-SUSP2-${timestamp}`,
        'TEST_Producto Para Suspender',
        'Producto para suspender',
        95.00,
        'producto',
        'activo',
        vendedorUser.id,
        categoriaResult.rows[0].id,
        true
      ]);
      const producto = productoResult.rows[0];

      // Crear reporte
      const reportRes = await request(app)
        .post(`/api/products/${producto.id}/report`)
        .set(getAuthHeaders(compradorUser.token))
        .send({
          tipo_reporte: 'producto_prohibido',
          motivo_reporte: 'Reporte para suspender'
        })
        .expect(201);

      const reporteId = reportRes.body.data.id;

      // Resolver reporte suspendiendo
      const res = await request(app)
        .patch(`/api/reports/${reporteId}/resolve`)
        .set(getAuthHeaders(moderadorUser.token))
        .send({
          accion: 'suspender',
          decision_final: 'El producto queda suspendido temporalmente mientras se investiga más a fondo la denuncia recibida.',
          marcar_peligroso: false
        })
        .expect(200);

      expect(res.body).to.have.property('success', true);

      // Verificar producto suspendido
      const productoActualizado = await query('SELECT * FROM items WHERE id = $1', [producto.id]);
      expect(productoActualizado.rows[0].estado).to.equal('suspendido');
    });
  });

  describe('CP-009: Resolver Reporte - Marcar Peligroso', () => {
    it('debe permitir a un moderador marcar un producto como peligroso', async () => {
      // Crear nuevo producto
      const categoriaResult = await query('SELECT id FROM categorias LIMIT 1');
      const timestamp = Date.now();
      const productoResult = await query(`
        INSERT INTO items (
          codigo, nombre, descripcion, precio, tipo, estado, vendedor_id, categoria_id, disponibilidad
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        `TEST-PEL-${timestamp}`,
        'TEST_Producto Para Marcar Peligroso',
        'Producto para marcar como peligroso',
        85.00,
        'producto',
        'activo',
        vendedorUser.id,
        categoriaResult.rows[0].id,
        true
      ]);
      const producto = productoResult.rows[0];

      // Crear reporte
      const reportRes = await request(app)
        .post(`/api/products/${producto.id}/report`)
        .set(getAuthHeaders(compradorUser.token))
        .send({
          tipo_reporte: 'producto_prohibido',
          motivo_reporte: 'Reporte para marcar peligroso'
        })
        .expect(201);

      const reporteId = reportRes.body.data.id;

      // Resolver reporte marcando como peligroso
      const res = await request(app)
        .patch(`/api/reports/${reporteId}/resolve`)
        .set(getAuthHeaders(moderadorUser.token))
        .send({
          accion: 'eliminar',
          decision_final: 'Este producto representa un peligro grave para los usuarios. Contiene elementos que violan gravemente las políticas de seguridad.',
          marcar_peligroso: true
        })
        .expect(200);

      expect(res.body).to.have.property('success', true);

      // Verificar producto marcado como peligroso
      const productoActualizado = await query('SELECT * FROM items WHERE id = $1', [producto.id]);
      expect(productoActualizado.rows[0].estado).to.equal('peligroso');
      expect(productoActualizado.rows[0].es_peligroso).to.be.true;
    });
  });

  describe('CP-010: Crear Apelación', () => {
    it('debe permitir a un vendedor crear una apelación para su producto rechazado', async () => {
      const res = await request(app)
        .post(`/api/products/${productos.rechazado.id}/appeal`)
        .set(getAuthHeaders(vendedorUser.token))
        .send({
          motivo_apelacion: 'Considero que la decisión fue incorrecta. El producto cumple con todas las políticas y la información es verídica. Adjunto documentación adicional.',
          informacion_adicional: 'Documentos de certificación del producto'
        })
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('estado', 'en_apelacion');

      // Verificar en base de datos
      const apelacionResult = await query(
        'SELECT * FROM apelaciones WHERE item_id = $1 AND usuario_apelante_id = $2',
        [productos.rechazado.id, vendedorUser.id]
      );
      expect(apelacionResult.rows.length).to.equal(1);
      expect(apelacionResult.rows[0].estado).to.equal('en_apelacion');

      // Verificar que el producto cambió a en_apelacion
      const productoResult = await query('SELECT estado FROM items WHERE id = $1', [productos.rechazado.id]);
      expect(productoResult.rows[0].estado).to.equal('en_apelacion');
    });

    it('debe rechazar crear una segunda apelación para el mismo producto', async () => {
      // Crear primera apelación
      await request(app)
        .post(`/api/products/${productos.suspendido.id}/appeal`)
        .set(getAuthHeaders(vendedorUser.token))
        .send({
          motivo_apelacion: 'Primera apelación para este producto suspendido'
        })
        .expect(201);

      // Intentar crear segunda apelación
      const res = await request(app)
        .post(`/api/products/${productos.suspendido.id}/appeal`)
        .set(getAuthHeaders(vendedorUser.token))
        .send({
          motivo_apelacion: 'Segunda apelación que no debería permitirse'
        })
        .expect(400);

      expect(res.body).to.have.property('success', false);
      // El mensaje puede ser sobre apelación pendiente o sobre estado del producto
      expect(res.body.message).to.satisfy((msg) => 
        msg.includes('Ya existe una apelación pendiente') || 
        msg.includes('Solo se pueden apelar productos rechazados o suspendidos')
      );
    });
  });

  describe('CP-011: Resolver Apelación - Aprobar', () => {
    it('debe permitir a un moderador aprobar una apelación y reactivar el producto', async () => {
      // Crear apelación
      const apelacionRes = await request(app)
        .post(`/api/products/${productos.suspendido.id}/appeal`)
        .set(getAuthHeaders(vendedorUser.token))
        .send({
          motivo_apelacion: 'Apelación para aprobar'
        })
        .expect(201);

      const apelacionId = apelacionRes.body.data.id;

      // Resolver apelación aprobándola
      const res = await request(app)
        .patch(`/api/appeals/${apelacionId}/resolve`)
        .set(getAuthHeaders(moderadorUser.token))
        .send({
          decision: 'aprobar',
          decision_apelacion: 'Tras revisar la apelación y la documentación adicional, se determina que el producto cumple con las políticas. La decisión anterior se revierte y el producto queda activo.'
        })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('aprobada');

      // Verificar apelación
      const apelacionResult = await query('SELECT * FROM apelaciones WHERE id = $1', [apelacionId]);
      expect(apelacionResult.rows[0].estado).to.equal('resuelto');
      expect(apelacionResult.rows[0].moderador_revisor_id).to.equal(moderadorUser.id);

      // Verificar producto reactivado
      const productoResult = await query('SELECT * FROM items WHERE id = $1', [productos.suspendido.id]);
      expect(productoResult.rows[0].estado).to.equal('activo');
      expect(productoResult.rows[0].disponibilidad).to.be.true;
      expect(productoResult.rows[0].motivo_rechazo).to.be.null;
      expect(productoResult.rows[0].es_peligroso).to.be.false;
    });
  });

  describe('CP-012: Resolver Apelación - Rechazar', () => {
    it('debe permitir a un moderador rechazar una apelación manteniendo el estado del producto', async () => {
      // Crear nuevo producto rechazado
      const categoriaResult = await query('SELECT id FROM categorias LIMIT 1');
      const timestamp = Date.now();
      const productoResult = await query(`
        INSERT INTO items (
          codigo, nombre, descripcion, precio, tipo, estado, vendedor_id, categoria_id, disponibilidad, motivo_rechazo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        `TEST-APEL-${timestamp}`,
        'TEST_Producto Para Rechazar Apelación',
        'Producto para rechazar apelación',
        85.00,
        'producto',
        'rechazado',
        vendedorUser.id,
        categoriaResult.rows[0].id,
        false,
        'Producto rechazado inicialmente'
      ]);
      const producto = productoResult.rows[0];

      // Crear apelación
      const apelacionRes = await request(app)
        .post(`/api/products/${producto.id}/appeal`)
        .set(getAuthHeaders(vendedorUser.token))
        .send({
          motivo_apelacion: 'Apelación para rechazar'
        })
        .expect(201);

      const apelacionId = apelacionRes.body.data.id;

      // Resolver apelación rechazándola
      const res = await request(app)
        .patch(`/api/appeals/${apelacionId}/resolve`)
        .set(getAuthHeaders(moderadorUser.token))
        .send({
          decision: 'rechazar',
          decision_apelacion: 'Tras revisar la apelación, se confirma que la decisión original fue correcta. El producto no cumple con las políticas establecidas y la apelación es rechazada.'
        })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('rechazada');

      // Verificar apelación
      const apelacionResult = await query('SELECT * FROM apelaciones WHERE id = $1', [apelacionId]);
      expect(apelacionResult.rows[0].estado).to.equal('rechazado');

      // Verificar que el producto mantiene su estado de rechazo
      const productoActualizado = await query('SELECT * FROM items WHERE id = $1', [producto.id]);
      expect(productoActualizado.rows[0].estado).to.equal('rechazado');
    });
  });

});

