/**
 * Pruebas de Integración - Productos Guardados (Favoritos)
 * Casos CF-0111 a CF-0114: Guardar, retirar y listar productos guardados
 */

const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../src/app');
const { cleanAuthTables } = require('../../helpers/db.helpers');
const { 
  createTestSeller,
  createTestBuyer,
  getAuthHeaders
} = require('../../helpers/auth.helpers');
const {
  createActiveProduct,
  createRejectedProduct,
  getOrCreateTestCategory,
  getOrCreateTestLocation,
  cleanProductsTables
} = require('../../helpers/products.helpers');
const { query } = require('../../../src/config/database');

describe('7. Productos Guardados (Favoritos)', () => {
  
  let seller, buyer, category, location;
  let activeProduct, inactiveProduct;

  beforeEach(async () => {
    await cleanProductsTables();
    await cleanAuthTables();

    seller = await createTestSeller({
      correo: 'vendedor@saved.com'
    });

    buyer = await createTestBuyer({
      correo: 'comprador@saved.com'
    });

    category = await getOrCreateTestCategory();
    location = await getOrCreateTestLocation();

    activeProduct = await createActiveProduct({
      vendedor_id: seller.id,
      categoria_id: category.id,
      nombre: 'Producto Activo para Guardar'
    });

    inactiveProduct = await createRejectedProduct({
      vendedor_id: seller.id,
      categoria_id: category.id,
      nombre: 'Producto Inactivo'
    });
  });

  describe('7.1 Guardar/Retirar (CF-0111 a CF-0113)', () => {
    
    it('CF-0111: Comprador debe guardar producto activo', async () => {
      const res = await request(app)
        .post(`/api/products/${activeProduct.id}/save`)
        .set(getAuthHeaders(buyer.token))
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('guardado');

      // Verificar que el producto está guardado
      const savedCheck = await query(`
        SELECT * FROM productos_guardados 
        WHERE usuario_id = $1 AND item_id = $2
      `, [buyer.id, activeProduct.id]);

      expect(savedCheck.rows.length).to.equal(1);
    });

    it('CF-0112: Debe rechazar guardar producto ya guardado', async () => {
      // Guardar producto primero
      await request(app)
        .post(`/api/products/${activeProduct.id}/save`)
        .set(getAuthHeaders(buyer.token))
        .expect(201);

      // Intentar guardar de nuevo
      const res = await request(app)
        .post(`/api/products/${activeProduct.id}/save`)
        .set(getAuthHeaders(buyer.token))
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('ya está');
    });

    it('CF-0113: Comprador debe retirar producto guardado', async () => {
      // Guardar producto primero
      await request(app)
        .post(`/api/products/${activeProduct.id}/save`)
        .set(getAuthHeaders(buyer.token))
        .expect(201);

      // Retirar producto
      const res = await request(app)
        .delete(`/api/products/${activeProduct.id}/unsave`)
        .set(getAuthHeaders(buyer.token))
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('eliminado');

      // Verificar que el producto ya no está guardado
      const savedCheck = await query(`
        SELECT * FROM productos_guardados 
        WHERE usuario_id = $1 AND item_id = $2
      `, [buyer.id, activeProduct.id]);

      expect(savedCheck.rows.length).to.equal(0);
    });
  });

  describe('7.2 Listar Productos Guardados (CF-0114)', () => {
    
    beforeEach(async () => {
      // Guardar varios productos
      const product2 = await createActiveProduct({
        vendedor_id: seller.id,
        categoria_id: category.id,
        nombre: 'Producto 2'
      });

      await request(app)
        .post(`/api/products/${activeProduct.id}/save`)
        .set(getAuthHeaders(buyer.token))
        .expect(201);

      await request(app)
        .post(`/api/products/${product2.id}/save`)
        .set(getAuthHeaders(buyer.token))
        .expect(201);
    });

    it('CF-0114: Debe listar productos guardados del usuario', async () => {
      const res = await request(app)
        .get('/api/products/saved')
        .set(getAuthHeaders(buyer.token))
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.greaterThan(0);

      // Verificar que todos los productos están activos
      res.body.data.forEach(producto => {
        expect(producto.estado).to.equal('activo');
      });
    });
  });
});

