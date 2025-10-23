import React from 'react';
import { X, FileText, Shield, AlertCircle } from 'lucide-react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
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
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Términos de Servicio
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
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <p className="text-sm text-blue-800 font-medium">
              Última actualización: 23 de octubre de 2025
            </p>
          </div>

          {/* Introducción */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-indigo-600" />
              1. Introducción
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Bienvenido a nuestro Sistema de Ventas. Al utilizar nuestros servicios, aceptas cumplir con estos Términos de Servicio. Por favor, léelos detenidamente antes de registrarte o utilizar la plataforma.
            </p>
          </section>

          {/* Uso del Servicio */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              2. Uso del Servicio
            </h3>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                Al utilizar nuestro servicio, te comprometes a:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Proporcionar información veraz y actualizada durante el registro</li>
                <li>Mantener la confidencialidad de tu cuenta y contraseña</li>
                <li>No compartir tu cuenta con terceros</li>
                <li>Notificar inmediatamente cualquier uso no autorizado de tu cuenta</li>
                <li>Cumplir con todas las leyes y regulaciones aplicables</li>
              </ul>
            </div>
          </section>

          {/* Registro de Cuenta */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              3. Registro de Cuenta
            </h3>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                Para acceder a ciertas funcionalidades, debes crear una cuenta proporcionando:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cédula de identidad válida</li>
                <li>Nombre completo</li>
                <li>Correo electrónico activo</li>
                <li>Contraseña segura (mínimo 6 caracteres)</li>
              </ul>
              <p className="mt-3">
                Nos reservamos el derecho de rechazar o suspender cualquier cuenta que viole estos términos.
              </p>
            </div>
          </section>

          {/* Conducta del Usuario */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              4. Conducta del Usuario
            </h3>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-gray-700 space-y-2">
                  <p className="font-semibold text-yellow-800">Está prohibido:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Publicar contenido ofensivo, fraudulento o ilegal</li>
                    <li>Intentar acceder a cuentas de otros usuarios</li>
                    <li>Realizar actividades que dañen o interrumpan el servicio</li>
                    <li>Utilizar la plataforma para fines comerciales no autorizados</li>
                    <li>Falsificar información de productos o servicios</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Publicación de Productos */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              5. Publicación de Productos
            </h3>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                Los vendedores que publiquen productos deben:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Proporcionar descripciones precisas y completas</li>
                <li>Usar imágenes reales del producto (máximo 5 imágenes)</li>
                <li>Establecer precios justos y transparentes</li>
                <li>Cumplir con las entregas acordadas</li>
                <li>No publicar productos prohibidos o ilegales</li>
              </ul>
            </div>
          </section>

          {/* Suspensión y Terminación */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              6. Suspensión y Terminación
            </h3>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                Nos reservamos el derecho de suspender o eliminar tu cuenta si:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violas estos términos de servicio</li>
                <li>Incurres en actividades fraudulentas</li>
                <li>Recibes múltiples reportes de otros usuarios</li>
                <li>No respondes a investigaciones de moderadores</li>
              </ul>
            </div>
          </section>

          {/* Limitación de Responsabilidad */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              7. Limitación de Responsabilidad
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Nuestro servicio se proporciona "tal cual". No garantizamos que el servicio será ininterrumpido o libre de errores. No somos responsables de las transacciones realizadas entre usuarios ni de la calidad de los productos ofrecidos.
            </p>
          </section>

          {/* Modificaciones */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              8. Modificaciones a los Términos
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos inmediatamente después de su publicación. Te notificaremos de cambios significativos a través de tu correo electrónico registrado.
            </p>
          </section>

          {/* Contacto */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              9. Contacto
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Si tienes preguntas sobre estos Términos de Servicio, puedes contactarnos a través del correo electrónico de soporte o mediante el formulario de contacto en la plataforma.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

