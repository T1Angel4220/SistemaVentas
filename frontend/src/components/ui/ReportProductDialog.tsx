import React, { useState } from 'react';
import { X, AlertTriangle, Flag, Info } from 'lucide-react';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { Label } from './Label';

interface ReportProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  onSuccess: () => void;
}

const TIPOS_REPORTE = [
  { value: 'contenido_inapropiado', label: '⚠️ Contenido Inapropiado', desc: 'Contenido ofensivo o no apto' },
  { value: 'producto_prohibido', label: '🚫 Producto Prohibido', desc: 'Artículo ilegal o no permitido' },
  { value: 'informacion_falsa', label: '❌ Información Falsa', desc: 'Descripción engañosa o fraudulenta' },
  { value: 'spam', label: '📧 Spam', desc: 'Publicación repetitiva o no deseada' },
  { value: 'otro', label: '🔖 Otro', desc: 'Otro motivo no listado' },
];

export const ReportProductDialog: React.FC<ReportProductDialogProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  onSuccess
}) => {
  const [tipo_reporte, setTipoReporte] = useState('');
  const [motivo_reporte, setMotivoReporte] = useState('');
  const [informacion_adicional, setInformacionAdicional] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tipo_reporte) {
      setError('Debes seleccionar un tipo de reporte');
      return;
    }

    if (motivo_reporte.trim().length < 20) {
      setError('El motivo debe tener al menos 20 caracteres');
      return;
    }

    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const apiUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${apiUrl}/products/${productId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tipo_reporte,
          motivo_reporte,
          informacion_adicional: informacion_adicional || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'Error al crear el reporte');
      }
    } catch (err) {
      console.error('Error al reportar:', err);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Flag className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Reportar Producto</h2>
                <p className="text-red-100 text-sm">Ayúdanos a mantener la plataforma segura</p>
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Reportando: {productName}</h3>
                <p className="text-sm text-red-700">ID del producto: #{productId}</p>
              </div>
            </div>
          </div>

          {/* Tipo de reporte */}
          <div>
            <Label htmlFor="tipo" className="text-base font-semibold text-gray-900 mb-3 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
              Tipo de Reporte *
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {TIPOS_REPORTE.map((tipo) => (
                <label
                  key={tipo.value}
                  className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    tipo_reporte === tipo.value
                      ? 'border-red-500 bg-red-50 shadow-md'
                      : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="tipo_reporte"
                    value={tipo.value}
                    checked={tipo_reporte === tipo.value}
                    onChange={(e) => setTipoReporte(e.target.value)}
                    className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
                    required
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{tipo.label}</div>
                    <div className="text-sm text-gray-600 mt-0.5">{tipo.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Motivo del reporte */}
          <div>
            <Label htmlFor="motivo" className="text-base font-semibold text-gray-900 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
              Motivo del Reporte *
            </Label>
            <Textarea
              id="motivo"
              value={motivo_reporte}
              onChange={(e) => setMotivoReporte(e.target.value)}
              placeholder="Describe detalladamente el problema que encontraste con este producto (mínimo 20 caracteres)..."
              rows={5}
              className="w-full border-2 border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-xl"
              required
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">Mínimo 20 caracteres</p>
              <p className={`text-sm font-medium ${motivo_reporte.length >= 20 ? 'text-green-600' : 'text-gray-400'}`}>
                {motivo_reporte.length} / 20
              </p>
            </div>
          </div>

          {/* Información adicional (opcional) */}
          <div>
            <Label htmlFor="informacion_adicional" className="text-base font-semibold text-gray-900 mb-2">
              Información Adicional (Opcional)
            </Label>
            <Textarea
              id="informacion_adicional"
              value={informacion_adicional}
              onChange={(e) => setInformacionAdicional(e.target.value)}
              placeholder="URLs, capturas de pantalla, enlaces o cualquier evidencia que respalde tu reporte..."
              rows={3}
              className="w-full border-2 border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-xl"
            />
            <p className="text-sm text-gray-500 mt-2">
              Si tienes capturas de pantalla, puedes proporcionar los enlaces aquí
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Información importante */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 mb-2">⚖️ Política de Reportes</h4>
                <ul className="space-y-1 text-sm text-amber-800">
                  <li>• Los reportes falsos o malintencionados pueden resultar en sanciones</li>
                  <li>• Un moderador revisará tu reporte en las próximas 24 horas</li>
                  <li>• El vendedor no será notificado hasta que se tome una decisión</li>
                  <li>• Tu identidad se mantendrá confidencial durante la revisión</li>
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
              className="flex-1 h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={loading || !tipo_reporte || motivo_reporte.trim().length < 20}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Enviando...</span>
                </div>
              ) : (
                '🚩 Enviar Reporte'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

