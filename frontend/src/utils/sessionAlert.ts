/**
 * Sistema de alertas globales para sesiones cerradas
 * Permite mostrar una alerta profesional cuando el admin/moderador cierra la sesión
 */

type AlertCallback = (isOpen: boolean) => void;

class SessionAlertManager {
  private listeners: Set<AlertCallback> = new Set();

  /**
   * Registrar un listener para cambios en el estado de la alerta
   */
  subscribe(callback: AlertCallback) {
    this.listeners.add(callback);
    
    // Retornar función para desuscribirse
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Mostrar la alerta de sesión cerrada
   */
  show() {
    this.notifyListeners(true);
  }

  /**
   * Ocultar la alerta
   */
  hide() {
    this.notifyListeners(false);
  }

  /**
   * Notificar a todos los listeners
   */
  private notifyListeners(isOpen: boolean) {
    this.listeners.forEach(callback => callback(isOpen));
  }
}

// Instancia singleton
export const sessionAlertManager = new SessionAlertManager();

