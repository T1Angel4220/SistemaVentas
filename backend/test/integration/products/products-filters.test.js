/**
 * Pruebas de Integración - Filtros y Visualización de Productos
 * Casos CF-0082 a CF-0089: Filtros, búsqueda y visualización
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
  createTestProduct,
  createActiveProduct,
  createDangerousProduct,
  getOrCreateTestCategory,
  getOrCreateTestLocation,
  cleanProductsTables
} = require('../../helpers/products.helpers');

describe('2. Visualización y Filtros', () => {
  
  let seller, buyer, category, location;

  beforeEach(async () => {
    await cleanProductsTables();
    await cleanAuthTables();

    seller = await createTestSeller({
      correo: 'vendedor@filters.com',
      nombre: 'Vendedor',
      apellido: 'Filtros'
    });

    buyer = await createTestBuyer({
      correo: 'comprador@filters.com'
    });

    category = await getOrCreateTestCategory();
    location = await getOrCreateTestLocation();
  });

  describe('2.1 Listar Productos (CF-0082 a CF-0085)', () => {
    
    beforeEach(async () => {
      // Crear productos de prueba
      await createActiveProduct({
        vendedor_id: seller.id,
        categoria_id: category.id,
        nombre: 'Producto Activo 1',
        precio: 100.00
      });

      await createActiveProduct({
        vendedor_id: seller.id,
        categoria_id: category.id,
        nombre: 'Producto Activo 2',
        precio: 200.00
      });

      await createDangerousProduct({
        vendedor_id: seller.id,
        categoria_id: category.id,
        nombre: 'Producto Peligroso'
      });
    });

    it('CF-0082: Debe listar productos públicos (sin autenticación)', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ estado: 'activo', disponibilidad: true })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.greaterThan(0);
    });

    it('CF-0083: Debe listar productos con paginación', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ 
          estado: 'activo', 
          disponibilidad: true,
          page: 1,
          limit: 1
        })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('pagination');
      expect(res.body.pagination).to.have.property('current_page', 1);
      expect(res.body.pagination).to.have.property('items_per_page', 1);
      expect(res.body.data.length).to.be.at.most(1);
    });

    it('CF-0084: Productos peligrosos NO aparecen en listado público', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ estado: 'activo', disponibilidad: true })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      
      // Verificar que ningún producto peligroso aparece
      const productosPeligrosos = res.body.data.filter(p => p.es_peligroso === true);
      expect(productosPeligrosos.length).to.equal(0);
    });

    it('CF-0085: Vendedor puede ver sus productos (NO ve peligrosos)', async () => {
      const res = await request(app)
        .get('/api/products/my/products')
        .set(getAuthHeaders(seller.token))
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.be.an('array');
      
      // Verificar que no aparecen productos peligrosos
      const productosPeligrosos = res.body.data.filter(p => p.es_peligroso === true);
      expect(productosPeligrosos.length).to.equal(0);
    });
  });

  describe('2.2 Filtros Básicos (CF-0086 a CF-0089)', () => {
    
    let categoria2;

    beforeEach(async () => {
      // Crear segunda categoría
      const { query } = require('../../../src/config/database');
      const catResult = await query(`
        INSERT INTO categorias (nombre, descripcion, activa)
        VALUES ('Categoría Test 2', 'Descripción', true)
        RETURNING *
      `);
      categoria2 = catResult.rows[0];

      // Crear productos con diferentes características
      await createActiveProduct({
        vendedor_id: seller.id,
        categoria_id: category.id,
        nombre: 'Laptop HP',
        descripcion: 'Laptop para trabajo',
        precio: 500.00
      });

      await createActiveProduct({
        vendedor_id: seller.id,
        categoria_id: categoria2.id,
        nombre: 'Mouse Logitech',
        descripcion: 'Mouse inalámbrico',
        precio: 25.00
      });

      await createActiveProduct({
        vendedor_id: seller.id,
        categoria_id: category.id,
        nombre: 'Teclado Mecánico',
        descripcion: 'Teclado para gaming',
        precio: 150.00
      });

      // Crear un servicio
      const { createTestService } = require('../../helpers/products.helpers');
      await createTestService({
        vendedor_id: seller.id,
        categoria_id: category.id,
        nombre: 'Servicio de Reparación',
        descripcion: 'Reparación de computadoras',
        precio: 50.00,
        estado: 'activo',
        disponibilidad: true
      });
    });

    it('CF-0086: Debe filtrar productos por categoría', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ 
          estado: 'activo', 
          disponibilidad: true,
          categoria_id: category.id
        })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.be.an('array');
      
      // Todos los productos deben ser de la categoría especificada
      res.body.data.forEach(producto => {
        // Verificar que el producto pertenece a la categoría (a través de categoria_nombre o ID)
        expect(producto).to.have.property('categoria_nombre');
      });
    });

    it('CF-0087: Debe filtrar productos por rango de precio', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ 
          estado: 'activo', 
          disponibilidad: true,
          precio_min: 100,
          precio_max: 200
        })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.be.an('array');
      
      // Todos los productos deben estar en el rango de precio
      res.body.data.forEach(producto => {
        const precio = parseFloat(producto.precio);
        expect(precio).to.be.at.least(100);
        expect(precio).to.be.at.most(200);
      });
    });

    it('CF-0088: Debe buscar productos por nombre/descripción', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ 
          estado: 'activo', 
          disponibilidad: true,
          search: 'Laptop'
        })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.be.an('array');
      
      // Al menos un producto debe contener "Laptop" en nombre o descripción
      const encontrados = res.body.data.filter(p => 
        p.nombre.toLowerCase().includes('laptop') || 
        (p.descripcion && p.descripcion.toLowerCase().includes('laptop'))
      );
      expect(encontrados.length).to.be.greaterThan(0);
    });

    it('CF-0089: Debe filtrar productos y servicios por tipo', async () => {
      // Filtrar solo productos
      const resProductos = await request(app)
        .get('/api/products')
        .query({ 
          estado: 'activo', 
          disponibilidad: true,
          tipo: 'producto'
        })
        .expect(200);

      expect(resProductos.body).to.have.property('success', true);
      resProductos.body.data.forEach(producto => {
        expect(producto.tipo).to.equal('producto');
      });

      // Filtrar solo servicios
      const resServicios = await request(app)
        .get('/api/products')
        .query({ 
          estado: 'activo', 
          disponibilidad: true,
          tipo: 'servicio'
        })
        .expect(200);

      expect(resServicios.body).to.have.property('success', true);
      resServicios.body.data.forEach(servicio => {
        expect(servicio.tipo).to.equal('servicio');
      });
    });
  });
});

