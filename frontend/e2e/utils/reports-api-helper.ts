/**
 * Helper para operaciones de API relacionadas con reportes
 * Útil para setup y cleanup de datos de prueba
 */

export class ReportsApiHelper {
  private baseURL = 'http://localhost:3001/api';

  /**
   * Obtener token de autenticación desde localStorage
   */
  private async getToken(page: any): Promise<string | null> {
    return await page.evaluate(() => {
      return localStorage.getItem('accessToken');
    });
  }

  /**
   * Crear un reporte vía API
   */
  async createReport(
    page: any,
    productId: number,
    tipoReporte: string,
    motivoReporte: string,
    informacionAdicional?: string
  ): Promise<any> {
    const token = await this.getToken(page);
    if (!token) {
      return {
        success: false,
        message: 'No hay token de autenticación'
      };
    }

    try {
      const response = await page.request.post(`${this.baseURL}/products/${productId}/report`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: {
          tipo_reporte: tipoReporte,
          motivo_reporte: motivoReporte,
          informacion_adicional: informacionAdicional || undefined
        }
      });

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear el reporte'
      };
    }
  }

  /**
   * Obtener reportes pendientes
   */
  async getPendingReports(page: any): Promise<any> {
    const token = await this.getToken(page);
    if (!token) {
      return {
        success: false,
        message: 'No hay token de autenticación'
      };
    }

    try {
      const response = await page.request.get(`${this.baseURL}/reports/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener reportes'
      };
    }
  }

  /**
   * Resolver un reporte
   */
  async resolveReport(
    page: any,
    reportId: number,
    accion: 'aprobar' | 'rechazar' | 'suspender' | 'eliminar',
    decisionFinal: string,
    marcarPeligroso: boolean = false
  ): Promise<any> {
    const token = await this.getToken(page);
    if (!token) {
      return {
        success: false,
        message: 'No hay token de autenticación'
      };
    }

    try {
      const response = await page.request.patch(`${this.baseURL}/reports/${reportId}/resolve`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: {
          accion,
          decision_final: decisionFinal,
          marcar_peligroso: marcarPeligroso
        }
      });

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al resolver el reporte'
      };
    }
  }

  /**
   * Obtener reportes de un producto
   */
  async getProductReports(page: any, productId: number): Promise<any> {
    const token = await this.getToken(page);
    if (!token) {
      return {
        success: false,
        message: 'No hay token de autenticación'
      };
    }

    try {
      const response = await page.request.get(`${this.baseURL}/products/${productId}/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener reportes del producto'
      };
    }
  }

  /**
   * Obtener mis reportes
   */
  async getMyReports(page: any): Promise<any> {
    const token = await this.getToken(page);
    if (!token) {
      return {
        success: false,
        message: 'No hay token de autenticación'
      };
    }

    try {
      const response = await page.request.get(`${this.baseURL}/reports/my/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener mis reportes'
      };
    }
  }

  /**
   * Obtener estadísticas de reportes
   */
  async getStatistics(page: any): Promise<any> {
    const token = await this.getToken(page);
    if (!token) {
      return {
        success: false,
        message: 'No hay token de autenticación'
      };
    }

    try {
      const response = await page.request.get(`${this.baseURL}/reports/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener estadísticas'
      };
    }
  }

  /**
   * Crear un producto de prueba vía API
   */
  async createTestProduct(page: any, productData: {
    codigo: string;
    nombre: string;
    descripcion: string;
    precio: number;
    tipo: string;
    categoria_id: number;
    ubicacion_id: number;
    vendedor_id: number;
  }): Promise<any> {
    const token = await this.getToken(page);
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const formData = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    const response = await page.request.post(`${this.baseURL}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      multipart: productData as any
    });

    return await response.json();
  }
}


