/**
 * Sistema de alertas globales para cuentas suspendidas
 * Permite mostrar una alerta profesional cuando el admin/moderador suspende la cuenta
 */
class SuspendedAccountAlertManager {
    listeners = new Set();
    /**
     * Registrar un listener para cambios en el estado de la alerta
     */
    subscribe(callback) {
        this.listeners.add(callback);
        // Retornar función para desuscribirse
        return () => {
            this.listeners.delete(callback);
        };
    }
    /**
     * Mostrar la alerta de cuenta suspendida
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
    notifyListeners(isOpen) {
        this.listeners.forEach(callback => callback(isOpen));
    }
}
// Instancia singleton
export const suspendedAccountAlertManager = new SuspendedAccountAlertManager();
