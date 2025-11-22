import React, { useState } from 'react';
import { X, AlertCircle, FileText, Info } from 'lucide-react';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { Label } from './Label';

interface AppealProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  motivoRechazo?: string;
  onSuccess: () => void;
}

export const AppealProductDialog: React.FC<AppealProductDialogProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  motivoRechazo,
  onSuccess
}) => {
  const [motivo_apelacion, setMotivoApelacion] = useState('');
  const [informacion_adicional, setInformacionAdicional] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (motivo_apelacion.trim().length < 20) {
      setError('El motivo de la apelación debe tener al menos 20 caracteres');
      return;
    }

    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const apiUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${apiUrl}/products/${productId}/appeal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          motivo_apelacion,
          informacion_adicional: informacion_adicional || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'Error al crear la apelación');
      }
    } catch (err) {
      console.error('Error al apelar:', err);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Apelar Decisión</h2>
                <p className="text-purple-100 text-sm">Solicita una revisión de tu producto</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del producto */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 mb-1">Producto: {productName}</h3>
                {motivoRechazo && (
                  <div className="mt-2">
                    <p className="text-sm text-purple-700 font-medium mb-1">Motivo del rechazo:</p>
                    <p className="text-sm text-purple-800 bg-white/60 p-2 rounded">{motivoRechazo}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Motivo de apelación */}
          <div>
            <Label htmlFor="motivo" className="text-base font-semibold text-gray-900 mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-purple-600" />
              Motivo de la Apelación *
            </Label>
            <Textarea
              id="motivo"
              value={motivo_apelacion}
              onChange={(e) => setMotivoApelacion(e.target.value)}
              placeholder="Explica detalladamente por qué consideras que tu producto debe ser revisado nuevamente (mínimo 20 caracteres)..."
              rows={5}
              className="w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
              required
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">Mínimo 20 caracteres</p>
              <p className={`text-sm font-medium ${motivo_apelacion.length >= 20 ? 'text-green-600' : 'text-gray-400'}`}>
                {motivo_apelacion.length} / 20
              </p>
            </div>
          </div>

          {/* Información adicional */}
          <div>
            <Label htmlFor="info" className="text-base font-semibold text-gray-900 mb-2">
              Información Adicional (Opcional)
            </Label>
            <Textarea
              id="info"
              value={informacion_adicional}
              onChange={(e) => setInformacionAdicional(e.target.value)}
              placeholder="Proporciona cualquier información adicional que pueda ayudar en la revisión..."
              rows={4}
              className="w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Advertencia sobre productos apelables */}
          <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-orange-900 font-semibold">
                  ⚠️ Solo se pueden apelar productos <strong>rechazados</strong> o <strong>suspendidos</strong>
                </p>
                <p className="text-xs text-orange-800 mt-1">
                  Los productos marcados como <strong>peligrosos</strong> no pueden ser apelados debido a la gravedad de la violación.
                </p>
              </div>
            </div>
          </div>

          {/* Información importante */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">📋 Información Importante</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Tu apelación será revisada por un moderador</li>
                  <li>• El proceso puede tomar entre 24-48 horas</li>
                  <li>• Recibirás una notificación con la decisión final</li>
                  <li>• Asegúrate de proporcionar información clara y detallada</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={loading || motivo_apelacion.trim().length < 20}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Enviando...</span>
                </div>
              ) : (
                '📝 Enviar Apelación'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

