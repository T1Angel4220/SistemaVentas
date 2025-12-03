/**
 * Pruebas de Integración - Productos Peligrosos
 * Casos CF-0100 a CF-0105: Restricciones y bloqueo automático
 */

const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../src/app');
const { cleanAuthTables } = require('../../helpers/db.helpers');
const { 
  createTestSeller,
  createTestBuyer,
  createTestModerator,
  createTestAdmin,
  getAuthHeaders
} = require('../../helpers/auth.helpers');
const {
  createDangerousProduct,
  createActiveProduct,
  getOrCreateTestCategory,
  getOrCreateTestLocation,
  getProductById,
  countDangerousProducts,
  cleanProductsTables
} = require('../../helpers/products.helpers');
const { getUserById } = require('../../helpers/db.helpers');

describe('5. Productos Peligrosos', () => {
  
  let seller, buyer, moderator, admin, category, location;

  beforeEach(async () => {
    await cleanProductsTables();
    await cleanAuthTables();

    seller = await createTestSeller({
      correo: 'vendedor@dangerous.com'
    });

    buyer = await createTestBuyer({
      correo: 'comprador@dangerous.com'
    });

    moderator = await createTestModerator({
      correo: 'moderador@dangerous.com'
    });

    admin = await createTestAdmin({
      correo: 'admin@dangerous.com'
    });

    category = await getOrCreateTestCategory();
    location = await getOrCreateTestLocation();
  });

  describe('5.1 Restricciones (CF-0100 a CF-0103)', () => {
    
    let dangerousProduct, activeProduct;

    beforeEach(async () => {
      dangerousProduct = await createDangerousProduct({
        vendedor_id: seller.id,
        categoria_id: category.id
      });

      activeProduct = await createActiveProduct({
        vendedor_id: seller.id,
        categoria_id: category.id
      });
    });

    it('CF-0100: Producto peligroso NO debe aparecer en listado público', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ estado: 'activo', disponibilidad: true })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      
      // Verificar que ningún producto peligroso aparece
      const productosPeligrosos = res.body.data.filter(p => 
        p.es_peligroso === true || p.id === dangerousProduct.id
      );
      expect(productosPeligrosos.length).to.equal(0);
    });

    it('CF-0101: Vendedor NO debe poder eliminar producto peligroso', async () => {
      const res = await request(app)
        .delete(`/api/products/${dangerousProduct.id}`)
        .set(getAuthHeaders(seller.token))
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('peligroso');
    });

    it('CF-0102: Vendedor NO debe poder editar producto peligroso', async () => {
      const updateData = {
        nombre: 'Intento de modificar'
      };

      const res = await request(app)
        .put(`/api/products/${dangerousProduct.id}`)
        .set(getAuthHeaders(seller.token))
        .send(updateData)
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('peligroso');
    });

    it('CF-0103: Moderador debe poder ver productos peligrosos', async () => {
      const res = await request(app)
        .get('/api/products/moderation/pending')
        .set(getAuthHeaders(moderator.token))
        .query({ estado: 'peligroso' })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.be.an('array');
      
      // Debe poder ver productos peligrosos en el panel de moderación
      const productosPeligrosos = res.body.data.filter(p => p.es_peligroso === true);
      expect(productosPeligrosos.length).to.be.greaterThan(0);
    });
  });

  describe('5.2 Bloqueo Automático (CF-0104 a CF-0105)', () => {
    
    it('CF-0104: Vendedor con 3 productos peligrosos debe bloquearse automáticamente', async () => {
      // Crear 3 productos peligrosos
      await createDangerousProduct({
        vendedor_id: seller.id,
        categoria_id: category.id,
        nombre: 'Peligroso 1'
      });

      await createDangerousProduct({
        vendedor_id: seller.id,
        categoria_id: category.id,
        nombre: 'Peligroso 2'
      });

      // El tercer producto debe activar el bloqueo automático
      // Asegurar que la ubicación existe antes de crear el producto
      const testLocation = await getOrCreateTestLocation();
      
      const dangerousData = {
        codigo: `DANGER-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        nombre: 'Producto con drogas ilegales',
        descripcion: 'Venta de marihuana y cocaína',
        precio: 500.00,
        tipo: 'producto',
        categoria_id: category.id,
        ubicacion_provincia: testLocation.provincia,
        ubicacion_canton: testLocation.canton,
        ubicacion_direccion: 'Dirección peligrosa 444'
      };

      const res = await request(app)
        .post('/api/products')
        .set(getAuthHeaders(seller.token))
        .send(dangerousData)
        .expect(201);

      expect(res.body).to.have.property('success', true);

      // Verificar que el vendedor tiene 3 productos peligrosos
      const cantidadPeligrosos = await countDangerousProducts(seller.id);
      expect(cantidadPeligrosos).to.be.at.least(3);

      // Verificar que la cuenta fue bloqueada
      const user = await getUserById(seller.id);
      expect(user.estado).to.equal('suspendido');
    });

    it('CF-0105: Debe verificar que cuenta bloqueada tiene estado "suspendido"', async () => {
      // Crear 3 productos peligrosos para activar bloqueo
      await createDangerousProduct({
        vendedor_id: seller.id,
        categoria_id: category.id
      });

      await createDangerousProduct({
        vendedor_id: seller.id,
        categoria_id: category.id
      });

      // Asegurar que la ubicación existe antes de crear el producto
      const testLocation = await getOrCreateTestLocation();
      
      const dangerousData = {
        codigo: `DANGER-BLOCK-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        nombre: 'Producto peligroso para bloqueo',
        descripcion: 'Contenido con armas y drogas',
        precio: 1000.00,
        tipo: 'producto',
        categoria_id: category.id,
        ubicacion_provincia: testLocation.provincia,
        ubicacion_canton: testLocation.canton,
        ubicacion_direccion: 'Dirección bloqueo 555'
      };

      await request(app)
        .post('/api/products')
        .set(getAuthHeaders(seller.token))
        .send(dangerousData)
        .expect(201);

      // Verificar que la cuenta está suspendida
      const user = await getUserById(seller.id);
      expect(user.estado).to.equal('suspendido');
    });
  });
});

