/**
 * Pruebas de Integración - Sistema de Apelaciones
 * Casos CF-095 a CF-100: Crear y resolver apelaciones
 */

const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../src/app');
const { cleanAuthTables } = require('../../helpers/db.helpers');
const { 
  createTestSeller,
  createTestBuyer,
  createTestModerator,
  getAuthHeaders
} = require('../../helpers/auth.helpers');
const {
  createRejectedProduct,
  createSuspendedProduct,
  createDangerousProduct,
  createActiveProduct,
  getOrCreateTestCategory,
  getOrCreateTestLocation,
  getProductById,
  cleanProductsTables
} = require('../../helpers/products.helpers');

describe('4. Sistema de Apelaciones', () => {
  
  let seller, buyer, moderator, category, location;

  beforeEach(async () => {
    await cleanProductsTables();
    await cleanAuthTables();

    seller = await createTestSeller({
      correo: 'vendedor@appeals.com'
    });

    buyer = await createTestBuyer({
      correo: 'comprador@appeals.com'
    });

    moderator = await createTestModerator({
      correo: 'moderador@appeals.com'
    });

    category = await getOrCreateTestCategory();
    location = await getOrCreateTestLocation();
  });

  describe('4.1 Crear Apelación (CF-095 a CF-098)', () => {
    
    let rejectedProduct, suspendedProduct, dangerousProduct, activeProduct;

    beforeEach(async () => {
      rejectedProduct = await createRejectedProduct({
        vendedor_id: seller.id,
        categoria_id: category.id
      });

      suspendedProduct = await createSuspendedProduct({
        vendedor_id: seller.id,
        categoria_id: category.id
      });

      dangerousProduct = await createDangerousProduct({
        vendedor_id: seller.id,
        categoria_id: category.id
      });

      activeProduct = await createActiveProduct({
        vendedor_id: seller.id,
        categoria_id: category.id
      });
    });

    it('CF-095: Vendedor debe crear apelación para producto rechazado', async () => {
      const appealData = {
        motivo_apelacion: 'Este producto fue rechazado incorrectamente. El contenido es apropiado y cumple con todas las políticas.',
        informacion_adicional: 'Información adicional sobre por qué el producto debería ser aprobado'
      };

      const res = await request(app)
        .post(`/api/products/${rejectedProduct.id}/appeal`)
        .set(getAuthHeaders(seller.token))
        .send(appealData)
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('id');
      expect(res.body.data.estado).to.equal('en_apelacion');

      // Verificar que el producto cambió a estado "en_apelacion"
      const product = await getProductById(rejectedProduct.id);
      expect(product.estado).to.equal('en_apelacion');
    });

    it('CF-096: Debe rechazar crear apelación para producto peligroso', async () => {
      const appealData = {
        motivo_apelacion: 'Intento de apelar producto peligroso',
        informacion_adicional: 'Información adicional'
      };

      const res = await request(app)
        .post(`/api/products/${dangerousProduct.id}/appeal`)
        .set(getAuthHeaders(seller.token))
        .send(appealData)
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('peligroso');
    });

    it('CF-097: Debe rechazar crear apelación sin ser propietario', async () => {
      const otherSeller = await createTestSeller({
        correo: 'otro@vendedor.com'
      });

      const appealData = {
        motivo_apelacion: 'Intento de apelar producto de otro vendedor',
        informacion_adicional: 'Información adicional'
      };

      const res = await request(app)
        .post(`/api/products/${rejectedProduct.id}/appeal`)
        .set(getAuthHeaders(otherSeller.token))
        .send(appealData)
        .expect(403);

      expect(res.body).to.have.property('success', false);
    });

    it('CF-098: Debe verificar que producto cambia a estado "en_apelacion"', async () => {
      const appealData = {
        motivo_apelacion: 'El producto fue suspendido incorrectamente. Solicito revisión.',
        informacion_adicional: 'Información adicional'
      };

      const res = await request(app)
        .post(`/api/products/${suspendedProduct.id}/appeal`)
        .set(getAuthHeaders(seller.token))
        .send(appealData)
        .expect(201);

      expect(res.body).to.have.property('success', true);

      // Verificar que el producto cambió de estado
      const product = await getProductById(suspendedProduct.id);
      expect(product.estado).to.equal('en_apelacion');
    });
  });

  describe('4.2 Resolver Apelación (CF-099 a CF-100)', () => {
    
    let appealProduct, appealId;

    beforeEach(async () => {
      // Crear producto rechazado y apelación
      appealProduct = await createRejectedProduct({
        vendedor_id: seller.id,
        categoria_id: category.id
      });

      // Crear la apelación
      const { query } = require('../../../src/config/database');
      const appealResult = await query(`
        INSERT INTO apelaciones (
          item_id, usuario_apelante_id, motivo_apelacion, estado, fecha_apelacion
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING *
      `, [
        appealProduct.id,
        seller.id,
        'Motivo de apelación de prueba con al menos 20 caracteres',
        'en_apelacion'
      ]);

      appealId = appealResult.rows[0].id;

      // Cambiar estado del producto a en_apelacion
      await query(`
        UPDATE items SET estado = 'en_apelacion' WHERE id = $1
      `, [appealProduct.id]);
    });

    it('CF-099: Moderador debe aprobar apelación (producto pasa a activo)', async () => {
      const decisionData = {
        decision: 'aprobar',
        decision_apelacion: 'Después de revisar, el producto cumple con las políticas. Se aprueba la apelación.',
        nuevo_estado_producto: 'activo'
      };

      const res = await request(app)
        .patch(`/api/appeals/${appealId}/resolve`)
        .set(getAuthHeaders(moderator.token))
        .send(decisionData)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('aprobada');

      // Verificar que el producto cambió a activo
      const product = await getProductById(appealProduct.id);
      expect(product.estado).to.equal('activo');
      expect(product.disponibilidad).to.equal(true);
    });

    it('CF-100: Moderador debe rechazar apelación (producto permanece rechazado)', async () => {
      const decisionData = {
        decision: 'rechazar',
        decision_apelacion: 'Después de revisar, el producto no cumple con las políticas. Se mantiene el rechazo.',
        nuevo_estado_producto: 'rechazado'
      };

      const res = await request(app)
        .patch(`/api/appeals/${appealId}/resolve`)
        .set(getAuthHeaders(moderator.token))
        .send(decisionData)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('rechazada');

      // Verificar que el producto permanece rechazado
      const product = await getProductById(appealProduct.id);
      expect(product.estado).to.equal('rechazado');
    });
  });
});

