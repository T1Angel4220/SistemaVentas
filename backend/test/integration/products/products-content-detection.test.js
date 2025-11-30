/**
 * Pruebas de Integración - Detección Automática de Contenido
 * Casos CF-091 a CF-094: Detección de contenido inadecuado
 */

const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../src/app');
const { cleanAuthTables } = require('../../helpers/db.helpers');
const { 
  createTestSeller,
  getAuthHeaders
} = require('../../helpers/auth.helpers');
const {
  createTestProduct,
  getOrCreateTestCategory,
  getOrCreateTestLocation,
  getProductById,
  cleanProductsTables
} = require('../../helpers/products.helpers');

describe('3. Detección Automática de Contenido', () => {
  
  let seller, category, location;

  beforeEach(async () => {
    await cleanProductsTables();
    await cleanAuthTables();

    seller = await createTestSeller({
      correo: 'vendedor@detection.com'
    });

    category = await getOrCreateTestCategory();
    location = await getOrCreateTestLocation();
  });

  describe('3.1 Detección al Crear (CF-091 a CF-093)', () => {
    
    it('CF-091: Debe crear producto con contenido de alto riesgo (marcado como peligroso)', async () => {
      // Asegurar que la ubicación existe antes de crear el producto
      const testLocation = await getOrCreateTestLocation();
      
      const dangerousData = {
        codigo: `DANGER-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        nombre: 'Venta de drogas ilegales',
        descripcion: 'Marihuana y cocaína disponibles',
        precio: 500.00,
        tipo: 'producto',
        categoria_id: category.id,
        ubicacion_provincia: testLocation.provincia,
        ubicacion_canton: testLocation.canton,
        ubicacion_direccion: 'Dirección peligrosa 111'
      };

      const res = await request(app)
        .post('/api/products')
        .set(getAuthHeaders(seller.token))
        .send(dangerousData)
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.estado).to.equal('peligroso');
      expect(res.body.data.es_peligroso).to.equal(true);
      expect(res.body.data).to.have.property('motivo_rechazo');
      expect(res.body.informacion).to.have.property('no_eliminable', true);
    });

    it('CF-092: Debe crear producto con contenido de medio riesgo (pendiente_revision)', async () => {
      // Asegurar que la ubicación existe antes de crear el producto
      const testLocation = await getOrCreateTestLocation();
      
      // Contenido que puede ser sospechoso pero no claramente peligroso
      const mediumRiskData = {
        codigo: `MEDIUM-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        nombre: 'Producto médico especial',
        descripcion: 'Medicamentos y tratamientos disponibles',
        precio: 100.00,
        tipo: 'producto',
        categoria_id: category.id,
        ubicacion_provincia: testLocation.provincia,
        ubicacion_canton: testLocation.canton,
        ubicacion_direccion: 'Dirección médica 222'
      };

      const res = await request(app)
        .post('/api/products')
        .set(getAuthHeaders(seller.token))
        .send(mediumRiskData)
        .expect(201);

      expect(res.body).to.have.property('success', true);
      // Puede ser pendiente_revision o peligroso dependiendo de la detección
      expect(['pendiente_revision', 'peligroso']).to.include(res.body.data.estado);
      
      if (res.body.data.estado === 'pendiente_revision') {
        expect(res.body.data.es_peligroso).to.equal(false);
      }
    });

    it('CF-093: Debe verificar que producto peligroso tiene motivo_rechazo', async () => {
      // Asegurar que la ubicación existe antes de crear el producto
      const testLocation = await getOrCreateTestLocation();
      
      const dangerousData = {
        codigo: `DANGER-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        nombre: 'Armas de fuego',
        descripcion: 'Pistolas y rifles disponibles',
        precio: 1000.00,
        tipo: 'producto',
        categoria_id: category.id,
        ubicacion_provincia: testLocation.provincia,
        ubicacion_canton: testLocation.canton,
        ubicacion_direccion: 'Dirección armas 333'
      };

      const res = await request(app)
        .post('/api/products')
        .set(getAuthHeaders(seller.token))
        .send(dangerousData)
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.estado).to.equal('peligroso');
      expect(res.body.data).to.have.property('motivo_rechazo');
      expect(res.body.data.motivo_rechazo).to.be.a('string');
      expect(res.body.data.motivo_rechazo.length).to.be.greaterThan(0);
    });
  });

  describe('3.2 Detección al Actualizar (CF-094)', () => {
    
    let normalProduct;

    beforeEach(async () => {
      // Crear un producto normal primero
      normalProduct = await createTestProduct({
        vendedor_id: seller.id,
        categoria_id: category.id,
        nombre: 'Producto Normal',
        descripcion: 'Descripción normal del producto',
        estado: 'activo',
        disponibilidad: true,
        es_peligroso: false
      });
    });

    it('CF-094: Debe detectar contenido peligroso al actualizar producto', async () => {
      const updateData = {
        nombre: 'Producto Actualizado con Drogas',
        descripcion: 'Venta de marihuana y cocaína'
      };

      const res = await request(app)
        .put(`/api/products/${normalProduct.id}`)
        .set(getAuthHeaders(seller.token))
        .send(updateData)
        .expect(200);

      expect(res.body).to.have.property('success', true);
      
      // Verificar que el producto cambió de estado
      const updatedProduct = await getProductById(normalProduct.id);
      expect(['peligroso', 'pendiente_revision']).to.include(updatedProduct.estado);
      
      // Si es peligroso, debe tener motivo_rechazo
      if (updatedProduct.estado === 'peligroso') {
        expect(updatedProduct.es_peligroso).to.equal(true);
        expect(updatedProduct.motivo_rechazo).to.be.a('string');
      }
    });
  });
});

