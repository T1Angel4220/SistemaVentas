/**
 * Pruebas de Integración - Moderación de Productos
 * Casos CF-116 a CF-120: Aprobar, rechazar, suspender y marcar como peligroso
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
  createTestProduct,
  getOrCreateTestCategory,
  getOrCreateTestLocation,
  getProductById,
  cleanProductsTables
} = require('../../helpers/products.helpers');

describe('8. Moderación', () => {
  
  let seller, buyer, moderator, category, location;

  beforeEach(async () => {
    await cleanProductsTables();
    await cleanAuthTables();

    seller = await createTestSeller({
      correo: 'vendedor@moderation.com'
    });

    buyer = await createTestBuyer({
      correo: 'comprador@moderation.com'
    });

    moderator = await createTestModerator({
      correo: 'moderador@moderation.com'
    });

    category = await getOrCreateTestCategory();
    location = await getOrCreateTestLocation();
  });

  describe('8.1 Moderar Producto (CF-116 a CF-120)', () => {
    
    let pendingProduct;

    beforeEach(async () => {
      pendingProduct = await createTestProduct({
        vendedor_id: seller.id,
        categoria_id: category.id,
        estado: 'pendiente_revision',
        disponibilidad: false
      });
    });

    it('CF-116: Moderador debe aprobar producto (pasa a activo)', async () => {
      const moderationData = {
        accion: 'aprobar',
        motivo: 'Producto cumple con todas las políticas',
        decision_final: 'Aprobado'
      };

      const res = await request(app)
        .patch(`/api/products/${pendingProduct.id}/moderate`)
        .set(getAuthHeaders(moderator.token))
        .send(moderationData)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('aprobar');

      // Verificar que el producto cambió a activo
      const product = await getProductById(pendingProduct.id);
      expect(product.estado).to.equal('activo');
      expect(product.disponibilidad).to.equal(true);
    });

    it('CF-117: Moderador debe rechazar producto (pasa a rechazado)', async () => {
      const moderationData = {
        accion: 'rechazar',
        motivo: 'Producto no cumple con las políticas de la plataforma',
        decision_final: 'Rechazado'
      };

      const res = await request(app)
        .patch(`/api/products/${pendingProduct.id}/moderate`)
        .set(getAuthHeaders(moderator.token))
        .send(moderationData)
        .expect(200);

      expect(res.body).to.have.property('success', true);

      // Verificar que el producto cambió a rechazado
      const product = await getProductById(pendingProduct.id);
      expect(product.estado).to.equal('rechazado');
    });

    it('CF-118: Moderador debe suspender producto', async () => {
      const moderationData = {
        accion: 'suspender',
        motivo: 'Producto suspendido temporalmente para revisión',
        decision_final: 'Suspendido'
      };

      const res = await request(app)
        .patch(`/api/products/${pendingProduct.id}/moderate`)
        .set(getAuthHeaders(moderator.token))
        .send(moderationData)
        .expect(200);

      expect(res.body).to.have.property('success', true);

      // Verificar que el producto cambió a suspendido
      const product = await getProductById(pendingProduct.id);
      expect(product.estado).to.equal('suspendido');
    });

    it('CF-119: Moderador debe marcar producto como peligroso', async () => {
      const moderationData = {
        accion: 'marcar_peligroso',
        motivo: 'Producto contiene contenido peligroso',
        decision_final: 'Marcado como peligroso'
      };

      const res = await request(app)
        .patch(`/api/products/${pendingProduct.id}/moderate`)
        .set(getAuthHeaders(moderator.token))
        .send(moderationData)
        .expect(200);

      expect(res.body).to.have.property('success', true);

      // Verificar que el producto fue marcado como peligroso
      const product = await getProductById(pendingProduct.id);
      expect(product.estado).to.equal('peligroso');
      expect(product.es_peligroso).to.equal(true);
    });

    it('CF-120: Comprador NO debe poder moderar', async () => {
      const moderationData = {
        accion: 'aprobar',
        motivo: 'Intento de moderar como comprador'
      };

      const res = await request(app)
        .patch(`/api/products/${pendingProduct.id}/moderate`)
        .set(getAuthHeaders(buyer.token))
        .send(moderationData)
        .expect(403);

      expect(res.body).to.have.property('success', false);
    });
  });
});

