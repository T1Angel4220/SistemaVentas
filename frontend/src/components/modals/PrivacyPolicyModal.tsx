import React from 'react';
import { X, ShieldCheck, Database, Eye, Lock, UserCheck } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Política de Privacidad
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          
          {/* Fecha de última actualización */}
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
            <p className="text-sm text-emerald-800 font-medium">
              Última actualización: 23 de octubre de 2025
            </p>
          </div>

          {/* Introducción */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2 text-emerald-600" />
              1. Introducción
            </h3>
            <p className="text-gray-700 leading-relaxed">
              En nuestro Sistema de Ventas, tu privacidad es una prioridad. Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos tu información personal cuando utilizas nuestra plataforma.
            </p>
          </section>

          {/* Información que Recopilamos */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <Database className="h-5 w-5 mr-2 text-emerald-600" />
              2. Información que Recopilamos
            </h3>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">2.1 Información Personal</h4>
                <p className="mb-2">Recopilamos la siguiente información cuando te registras:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Número de cédula</li>
                  <li>Nombre completo</li>
                  <li>Correo electrónico</li>
                  <li>Número de teléfono (opcional)</li>
                  <li>Dirección física (opcional)</li>
                  <li>Género (opcional)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">2.2 Información de Uso</h4>
                <p className="mb-2">Automáticamente recopilamos:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Dirección IP</li>
                  <li>Tipo de navegador y dispositivo</li>
                  <li>Páginas visitadas y tiempo de uso</li>
                  <li>Productos visualizados y guardados</li>
                  <li>Historial de sesiones</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">2.3 Información de Productos</h4>
                <p className="mb-2">Si eres vendedor, almacenamos:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Descripciones de productos</li>
                  <li>Imágenes de productos</li>
                  <li>Precios y ubicaciones</li>
                  <li>Historial de publicaciones</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cómo Usamos tu Información */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <Eye className="h-5 w-5 mr-2 text-emerald-600" />
              3. Cómo Usamos tu Información
            </h3>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>Utilizamos tu información personal para:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Crear y gestionar tu cuenta de usuario</li>
                <li>Procesar tus publicaciones de productos</li>
                <li>Enviarte notificaciones importantes sobre tu cuenta</li>
                <li>Mejorar nuestros servicios y experiencia de usuario</li>
                <li>Prevenir fraudes y actividades maliciosas</li>
                <li>Cumplir con obligaciones legales</li>
                <li>Responder a tus consultas y solicitudes de soporte</li>
              </ul>
            </div>
          </section>

          {/* Compartir Información */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              4. Compartir tu Información
            </h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-blue-800">Importante:</strong> No vendemos tu información personal a terceros. Solo compartimos información cuando:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-gray-700">
                <li>Es necesario para proporcionar el servicio</li>
                <li>Lo exige la ley o autoridades competentes</li>
                <li>Has dado tu consentimiento explícito</li>
                <li>Es para proteger la seguridad de la plataforma</li>
              </ul>
            </div>
          </section>

          {/* Seguridad de Datos */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <Lock className="h-5 w-5 mr-2 text-emerald-600" />
              5. Seguridad de tus Datos
            </h3>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cifrado de contraseñas mediante bcrypt</li>
                <li>Tokens JWT para autenticación segura</li>
                <li>Conexiones HTTPS para transmisión de datos</li>
                <li>Monitoreo continuo de actividades sospechosas</li>
                <li>Control de acceso basado en roles (usuarios, moderadores, administradores)</li>
                <li>Registro de sesiones con información de IP y navegador</li>
              </ul>
            </div>
          </section>

          {/* Cookies y Tecnologías */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              6. Cookies y Tecnologías de Seguimiento
            </h3>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                Utilizamos cookies y tecnologías similares para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Mantener tu sesión activa</li>
                <li>Recordar tus preferencias</li>
                <li>Analizar el uso de la plataforma</li>
                <li>Mejorar la seguridad</li>
              </ul>
              <p className="mt-3">
                Puedes controlar las cookies desde la configuración de tu navegador, aunque esto puede afectar algunas funcionalidades.
              </p>
            </div>
          </section>

          {/* Derechos del Usuario */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-emerald-600" />
              7. Tus Derechos
            </h3>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>Como usuario, tienes derecho a:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Acceso:</strong> Solicitar una copia de tu información personal</li>
                <li><strong>Rectificación:</strong> Corregir información inexacta o incompleta</li>
                <li><strong>Eliminación:</strong> Solicitar la eliminación de tu cuenta y datos</li>
                <li><strong>Portabilidad:</strong> Obtener tus datos en formato estructurado</li>
                <li><strong>Oposición:</strong> Oponerte al procesamiento de tus datos en ciertos casos</li>
                <li><strong>Limitación:</strong> Solicitar la restricción del procesamiento de tus datos</li>
              </ul>
              <p className="mt-3">
                Para ejercer estos derechos, contacta a nuestro equipo de soporte.
              </p>
            </div>
          </section>

          {/* Retención de Datos */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              8. Retención de Datos
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Conservamos tu información personal mientras tu cuenta esté activa o según sea necesario para proporcionar servicios. Después de la eliminación de tu cuenta, podemos retener ciertos datos durante un período adicional por razones legales, contables o de seguridad.
            </p>
          </section>

          {/* Menores de Edad */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              9. Menores de Edad
            </h3>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <p className="text-gray-700 leading-relaxed">
                Nuestros servicios están destinados a personas mayores de 18 años. No recopilamos intencionalmente información de menores de edad. Si descubrimos que hemos recopilado datos de un menor, eliminaremos esa información de inmediato.
              </p>
            </div>
          </section>

          {/* Cambios a la Política */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              10. Cambios a esta Política
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cambios significativos a través de un aviso destacado en la plataforma o por correo electrónico. Te recomendamos revisar esta política periódicamente.
            </p>
          </section>

          {/* Contacto */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              11. Contacto
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Si tienes preguntas, inquietudes o solicitudes relacionadas con esta Política de Privacidad, puedes contactarnos a través del formulario de soporte en la plataforma o mediante el correo electrónico de atención al cliente.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

