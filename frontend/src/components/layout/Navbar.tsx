import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { LogoutConfirmModal } from '../ui/LogoutConfirmModal';
import { LogOut, User, Settings, Shield, AlertTriangle, Flag, FileText } from 'lucide-react';
import { apiService } from '../../services/api';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [dangerousProductsCount, setDangerousProductsCount] = useState(0);

  // Cargar conteo de productos peligrosos si es vendedor
  useEffect(() => {
    const loadDangerousCount = async () => {
      if (user?.tipo_usuario === 'vendedor') {
        try {
          const response = await fetch('http://localhost:3001/api/products/my-dangerous', {
            headers: {
              'Authorization': `Bearer ${apiService.getToken()}`
            }
          });
          const data = await response.json();
          if (data.success) {
            setDangerousProductsCount(data.data.length);
          }
        } catch (error) {
          console.error('Error al cargar conteo de productos peligrosos:', error);
        }
      }
    };
    
    loadDangerousCount();
  }, [user]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      // Usar window.location para forzar recarga completa y evitar problemas de estado
      window.location.href = '/login';
    } catch (error) {
      console.error('Error en logout:', error);
      // Si hay error, forzar redirección de todas formas
      window.location.href = '/login';
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  if (!isAuthenticated || !user) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                Sistema de Ventas
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline">Iniciar Sesión</Button>
              </Link>
              <Link to="/register">
                <Button>Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-8">
          <div className="flex items-center space-x-8 flex-1">
            <Link to="/dashboard" className="text-xl font-bold text-gray-900 whitespace-nowrap">
              Sistema de Ventas
            </Link>
            <div className="hidden md:flex items-center space-x-6 flex-1">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-sm"
              >
                Dashboard
              </Link>
              {/* Solo mostrar "Productos" si es comprador, vendedor o moderador (NO admin) */}
              {(user.tipo_usuario === 'comprador' || user.tipo_usuario === 'vendedor' || user.tipo_usuario === 'moderador') && (
                <Link
                  to="/products"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-sm"
                >
                  Productos
                </Link>
              )}
              {/* Solo mostrar "Mis Productos" si es vendedor (NO admin o moderador) */}
              {user.tipo_usuario === 'vendedor' && (
                <Link
                  to="/my-products"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-sm"
                >
                  Mis Productos
                </Link>
              )}
              {/* Solo mostrar "Productos Peligrosos" si es vendedor Y tiene productos peligrosos */}
              {user.tipo_usuario === 'vendedor' && dangerousProductsCount > 0 && (
                <Link
                  to="/my-products/dangerous"
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-md text-sm font-medium flex items-center relative transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-red-200/50 group"
                >
                  <AlertTriangle className="h-4 w-4 mr-1 transition-transform duration-300 group-hover:rotate-12" />
                  Peligrosos
                  <span className="ml-1.5 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {dangerousProductsCount}
                  </span>
                </Link>
              )}
              <Link
                to="/chat"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-sm"
              >
                Chat
              </Link>
              {user.tipo_usuario === 'moderador' && (
                <>
                  <div className="h-6 w-px bg-gray-300 mx-2"></div>
                  <Link
                    to="/products/moderation"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-blue-200/50 group"
                  >
                    <Shield className="h-4 w-4 mr-1.5 transition-transform duration-300 group-hover:scale-110" />
                    Moderación
                  </Link>
                  <Link
                    to="/moderation/reports"
                    className="text-orange-600 hover:text-orange-800 hover:bg-orange-50 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-orange-200/50 group"
                  >
                    <Flag className="h-4 w-4 mr-1.5 transition-transform duration-300 group-hover:rotate-12" />
                    Reportes
                  </Link>
                  <Link
                    to="/moderation/appeals"
                    className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-purple-200/50 group"
                  >
                    <FileText className="h-4 w-4 mr-1.5 transition-transform duration-300 group-hover:scale-110" />
                    Apelaciones
                  </Link>
                </>
              )}
              {user.tipo_usuario === 'administrador' && (
                <>
                  <div className="h-6 w-px bg-gray-300 mx-2"></div>
                  <Link
                    to="/products/moderation"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-blue-200/50 group"
                  >
                    <Shield className="h-4 w-4 mr-1.5 transition-transform duration-300 group-hover:scale-110" />
                    Administración
                  </Link>
                  <Link
                    to="/moderation/reports"
                    className="text-orange-600 hover:text-orange-800 hover:bg-orange-50 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-orange-200/50 group"
                  >
                    <Flag className="h-4 w-4 mr-1.5 transition-transform duration-300 group-hover:rotate-12" />
                    Reportes
                  </Link>
                  <Link
                    to="/moderation/appeals"
                    className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-purple-200/50 group"
                  >
                    <FileText className="h-4 w-4 mr-1.5 transition-transform duration-300 group-hover:scale-110" />
                    Apelaciones
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.nombre || ''} {user.apellido || ''}
              </p>
              <p className="text-xs text-gray-500">
                {user.tipo_usuario ? user.tipo_usuario.charAt(0).toUpperCase() + user.tipo_usuario.slice(1) : 'Usuario'}
              </p>
            </div>
            
            <Link to="/profile" className="group relative">
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-200/50"
              >
                <User className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              </Button>
              {/* Tooltip */}
              <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                Mi Perfil
              </span>
            </Link>
            
            <Link to="/settings" className="group relative">
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-purple-50 hover:text-purple-600 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-200/50"
              >
                <Settings className="h-5 w-5 transition-transform duration-500 group-hover:rotate-90" />
              </Button>
              {/* Tooltip */}
              <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                Configuración
              </span>
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogoutClick}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50 hover:scale-105 hover:shadow-md hover:shadow-red-200/50 transition-all duration-300 flex items-center gap-2 group"
            >
              <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />
              <span className="text-sm font-medium">Salir</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de logout */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        userName={`${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Usuario'}
      />
    </nav>
  );
};

