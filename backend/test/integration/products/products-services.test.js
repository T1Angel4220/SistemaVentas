/**
 * Pruebas de Integración - Servicios Específicos y Casos Edge
 * Casos CF-0120 a CF-0125: Servicios y validaciones
 */

const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../src/app');
const { cleanAuthTables } = require('../../helpers/db.helpers');
const { 
  createTestSeller,
  createSuspendedUser,
  getAuthHeaders
} = require('../../helpers/auth.helpers');
const {
  createTestProduct,
  createTestService,
  getOrCreateTestCategory,
  getOrCreateTestLocation,
  getProductById,
  cleanProductsTables
} = require('../../helpers/products.helpers');
const { query } = require('../../../src/config/database');

describe('9. Servicios Específicos y Casos Edge', () => {
  
  let seller, suspendedSeller, category, location;

  beforeEach(async () => {
    await cleanProductsTables();
    await cleanAuthTables();

    seller = await createTestSeller({
      correo: 'vendedor@services.com'
    });

    suspendedSeller = await createSuspendedUser({
      correo: 'suspendido@test.com',
      tipo_usuario: 'vendedor'
    });

    category = await getOrCreateTestCategory();
    location = await getOrCreateTestLocation();
  });

  describe('9.1 Servicios Específicos (CF-0120 a CF-0121)', () => {
    
    it('CF-0120: Debe crear servicio con información adicional', async () => {
      // Asegurar que la ubicación existe antes de crear el servicio
      const testLocation = await getOrCreateTestLocation();
      
      const serviceData = {
        codigo: `SERV-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        nombre: 'Servicio de Reparación',
        descripcion: 'Reparación de computadoras y laptops',
        precio: 75.00,
        tipo: 'servicio',
        categoria_id: category.id,
        ubicacion_provincia: testLocation.provincia,
        ubicacion_canton: testLocation.canton,
        ubicacion_direccion: 'Dirección servicio 666',
        horario_atencion: '09:00 - 18:00',
        dias_disponibles: 'Lunes a Viernes',
        duracion_estimada: '2 horas'
      };

      const res = await request(app)
        .post('/api/products')
        .set(getAuthHeaders(seller.token))
        .send(serviceData)
        .expect(201);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data.tipo).to.equal('servicio');

      // Verificar que el servicio tiene información adicional
      const serviceInfo = await query(`
        SELECT * FROM servicios WHERE item_id = $1
      `, [res.body.data.id]);

      expect(serviceInfo.rows.length).to.equal(1);
      expect(serviceInfo.rows[0].horario_atencion).to.equal(serviceData.horario_atencion);
      expect(serviceInfo.rows[0].dias_disponibles).to.equal(serviceData.dias_disponibles);
      expect(serviceInfo.rows[0].duracion_estimada).to.equal(serviceData.duracion_estimada);
    });

    it('CF-0121: Debe actualizar información de servicio', async () => {
      // Crear servicio primero
      const service = await createTestService({
        vendedor_id: seller.id,
        categoria_id: category.id,
        horario_atencion: '09:00 - 18:00',
        dias_disponibles: 'Lunes a Viernes',
        duracion_estimada: '1 hora',
        estado: 'activo',
        disponibilidad: true
      });

      const updateData = {
        horario_atencion: '10:00 - 19:00',
        dias_disponibles: 'Lunes a Sábado',
        duracion_estimada: '3 horas'
      };

      const res = await request(app)
        .put(`/api/products/${service.id}`)
        .set(getAuthHeaders(seller.token))
        .send(updateData)
        .expect(200);

      expect(res.body).to.have.property('success', true);

      // Verificar que la información del servicio fue actualizada
      const serviceInfo = await query(`
        SELECT * FROM servicios WHERE item_id = $1
      `, [service.id]);

      expect(serviceInfo.rows[0].horario_atencion).to.equal(updateData.horario_atencion);
      expect(serviceInfo.rows[0].dias_disponibles).to.equal(updateData.dias_disponibles);
      expect(serviceInfo.rows[0].duracion_estimada).to.equal(updateData.duracion_estimada);
    });
  });

  describe('9.2 Casos Edge y Validaciones (CF-0122 a CF-0125)', () => {
    
    it('CF-0122: Debe rechazar crear producto sin campos requeridos', async () => {
      const invalidData = {
        codigo: 'INVALID-001'
        // Faltan: nombre, descripcion, precio, tipo, categoria_id
      };

      const res = await request(app)
        .post('/api/products')
        .set(getAuthHeaders(seller.token))
        .send(invalidData)
        .expect(400);

      expect(res.body).to.have.property('success', false);
    });

    it('CF-0123: Debe rechazar crear producto con precio negativo', async () => {
      const testLocation = await getOrCreateTestLocation();
      
      const invalidData = {
        codigo: `NEG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        nombre: 'Producto Precio Negativo',
        descripcion: 'Descripción del producto',
        precio: -100.00,
        tipo: 'producto',
        categoria_id: category.id,
        ubicacion_provincia: testLocation.provincia,
        ubicacion_canton: testLocation.canton,
        ubicacion_direccion: 'Dirección precio negativo 888'
      };

      const res = await request(app)
        .post('/api/products')
        .set(getAuthHeaders(seller.token))
        .send(invalidData)
        .expect(400);

      expect(res.body).to.have.property('success', false);
    });

    it('CF-0124: Usuario suspendido NO debe crear productos', async () => {
      const testLocation = await getOrCreateTestLocation();
      
      const productData = {
        codigo: `SUSP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        nombre: 'Producto de Usuario Suspendido',
        descripcion: 'Descripción del producto suspendido',
        precio: 100.00,
        tipo: 'producto',
        categoria_id: category.id,
        ubicacion_provincia: testLocation.provincia,
        ubicacion_canton: testLocation.canton,
        ubicacion_direccion: 'Dirección suspendido 999'
      };

      // El usuario suspendido no debería tener sesión activa, pero intentamos
      // Si tiene token, debería fallar por estado suspendido
      const res = await request(app)
        .post('/api/products')
        .set(getAuthHeaders(suspendedSeller.token || seller.token))
        .send(productData);

      // Puede fallar por 401 (sin sesión) o 403 (suspendido)
      expect([401, 403]).to.include(res.status);
      expect(res.body).to.have.property('success', false);
    });

    it('CF-0125: Producto en revisión NO debe ser editado por vendedor', async () => {
      // Crear producto en revisión
      const pendingProduct = await createTestProduct({
        vendedor_id: seller.id,
        categoria_id: category.id,
        estado: 'pendiente_revision',
        disponibilidad: false
      });

      const updateData = {
        nombre: 'Intento de modificar en revisión'
      };

      const res = await request(app)
        .put(`/api/products/${pendingProduct.id}`)
        .set(getAuthHeaders(seller.token))
        .send(updateData)
        .expect(400);

      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.include('revisión');
    });
  });
});

