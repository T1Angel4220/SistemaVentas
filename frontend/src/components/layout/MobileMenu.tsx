import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { LogoutConfirmModal } from '../ui/LogoutConfirmModal';
import { apiService } from '../../services/api';
import {
  Home,
  Users,
  Flag,
  FileText,
  Shield,
  UserPlus,
  Package,
  ShoppingCart,
  MessageSquare,
  User,
  ChevronRight,
  LogOut,
  X,
  Menu,
  AlertTriangle
} from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onToggle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
    
    if (isOpen) {
      loadDangerousCount();
    }
  }, [user, isOpen]);

  if (!user) return null;

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error en logout:', error);
      window.location.href = '/login';
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  // Menú de navegación para administradores y moderadores
  const adminMenuItems = [
    {
      title: 'Inicio',
      icon: Home,
      description: 'Volver al dashboard principal',
      onClick: () => {
        navigate('/dashboard');
        onClose();
      },
      color: 'from-gray-500 to-gray-600'
    },
    {
      title: 'Gestión de Usuarios',
      icon: Users,
      description: 'Administra usuarios, roles y permisos',
      onClick: () => {
        navigate('/admin/users');
        onClose();
      },
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Gestión de Reportes',
      icon: Flag,
      description: 'Revisa reportes de productos y usuarios',
      onClick: () => {
        navigate('/moderation/reports');
        onClose();
      },
      color: 'from-red-500 to-orange-600'
    },
    {
      title: 'Gestión de Apelaciones',
      icon: FileText,
      description: 'Revisa apelaciones de vendedores',
      onClick: () => {
        navigate('/moderation/appeals');
        onClose();
      },
      color: 'from-purple-500 to-indigo-600'
    },
    {
      title: 'Moderación de Productos',
      icon: Shield,
      description: 'Revisa y aprueba productos',
      onClick: () => {
        navigate('/products/moderation');
        onClose();
      },
      color: 'from-purple-500 to-purple-600'
    },
  ];

  // Agregar opción de registrar moderador solo para administradores
  if (user?.tipo_usuario === 'administrador') {
    adminMenuItems.push({
      title: 'Registrar Moderador',
      icon: UserPlus,
      description: 'Crear nuevas cuentas de moderador',
      onClick: () => {
        navigate('/admin/register-moderator');
        onClose();
      },
      color: 'from-indigo-500 to-purple-600'
    });
  }

  // Menú de navegación para vendedores
  const sellerMenuItems = [
    {
      title: 'Inicio',
      icon: Home,
      description: 'Volver al dashboard principal',
      onClick: () => {
        navigate('/dashboard');
        onClose();
      },
      color: 'from-gray-500 to-gray-600'
    },
    {
      title: 'Mis Productos',
      icon: Package,
      description: 'Gestiona tus productos publicados',
      onClick: () => {
        navigate('/products/my');
        onClose();
      },
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Crear Producto',
      icon: ShoppingCart,
      description: 'Publica un nuevo producto',
      onClick: () => {
        navigate('/products/create');
        onClose();
      },
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Productos Guardados',
      icon: MessageSquare,
      description: 'Ver productos que te gustan',
      onClick: () => {
        navigate('/products/saved');
        onClose();
      },
      color: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Mi Perfil',
      icon: User,
      description: 'Edita tu información personal',
      onClick: () => {
        navigate('/profile');
        onClose();
      },
      color: 'from-purple-500 to-indigo-600'
    }
  ];

  // Menú de navegación para compradores
  const buyerMenuItems = [
    {
      title: 'Inicio',
      icon: Home,
      description: 'Volver al dashboard principal',
      onClick: () => {
        navigate('/dashboard');
        onClose();
      },
      color: 'from-gray-500 to-gray-600'
    },
    {
      title: 'Explorar Productos',
      icon: ShoppingCart,
      description: 'Descubre productos disponibles',
      onClick: () => {
        navigate('/products');
        onClose();
      },
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Productos Guardados',
      icon: MessageSquare,
      description: 'Ver productos que te gustan',
      onClick: () => {
        navigate('/products/saved');
        onClose();
      },
      color: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Mi Perfil',
      icon: User,
      description: 'Edita tu información personal',
      onClick: () => {
        navigate('/profile');
        onClose();
      },
      color: 'from-purple-500 to-indigo-600'
    }
  ];

  // Determinar qué menú mostrar
  const menuItems = 
    (user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador')
      ? adminMenuItems
      : user.tipo_usuario === 'vendedor'
        ? sellerMenuItems
        : buyerMenuItems;

  return (
    <>
      {/* Botón hamburguesa para abrir menú */}
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="lg:hidden bg-white/80 border-gray-300 hover:bg-gray-50 p-2"
      >
        {isOpen ? (
          <X className="h-5 w-5 text-gray-600" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600" />
        )}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Menú lateral */}
      <div className={`
        fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header del menú */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold">
                  {user.nombre?.charAt(0)}{user.apellido?.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{user.nombre} {user.apellido}</h3>
                <p className="text-blue-100 text-sm capitalize">{user.tipo_usuario}</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-blue-100 text-sm">
            {user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador' 
              ? 'Panel de Administración' 
              : user.tipo_usuario === 'vendedor' 
                ? 'Panel de Vendedor'
                : 'Panel de Comprador'
            }
          </p>
        </div>
        
        {/* Opciones del menú */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group border border-gray-100 hover:border-gray-200 hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                </div>
              </button>
            ))}
          </div>
          
          {/* Separador */}
          <div className="border-t border-gray-200 my-4"></div>
          
          {/* Opciones adicionales - Solo para admin/moderador */}
          {(user.tipo_usuario === 'administrador' || user.tipo_usuario === 'moderador') && (
            <div className="space-y-2">
              <button
                onClick={() => {
                  navigate('/products');
                  onClose();
                }}
                className="w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group border border-gray-100 hover:border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Ver Productos</h4>
                    <p className="text-xs text-gray-500 mt-1">Explora productos disponibles</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                </div>
              </button>
            </div>
          )}

          {/* Opciones adicionales para vendedores */}
          {user.tipo_usuario === 'vendedor' && (
            <div className="space-y-2">
              <button
                onClick={() => {
                  navigate('/products');
                  onClose();
                }}
                className="w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group border border-gray-100 hover:border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Explorar Productos</h4>
                    <p className="text-xs text-gray-500 mt-1">Ver productos disponibles</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                </div>
              </button>

              {/* Productos Peligrosos para vendedores */}
              {dangerousProductsCount > 0 && (
                <button
                  onClick={() => {
                    navigate('/my-products/dangerous');
                    onClose();
                  }}
                  className="w-full text-left p-4 rounded-xl hover:bg-red-50 transition-all duration-200 group border border-red-100 hover:border-red-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900 text-sm">Productos Peligrosos</h4>
                        <span className="bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                          {dangerousProductsCount}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Ver productos marcados como peligrosos</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Footer del menú */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Modal de confirmación de logout */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        userName={`${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Usuario'}
      />
    </>
  );
};

