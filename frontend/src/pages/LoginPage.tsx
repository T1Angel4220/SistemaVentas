import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/auth/LoginForm';
import { ShoppingCart, Shield, Users, MessageCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">
      {/* Panel izquierdo con información */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-center">
        <div className="max-w-md">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Sistema de Ventas</h1>
              <p className="text-blue-100">Multiempresa</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            La plataforma más completa para comprar y vender
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Comprar Fácil</h3>
                <p className="text-blue-100">Encuentra productos y servicios de calidad</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Vender Seguro</h3>
                <p className="text-blue-100">Publica tus productos con total seguridad</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Comunicación Directa</h3>
                <p className="text-blue-100">Chatea directamente con compradores y vendedores</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho con formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo para móvil */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema de Ventas</h1>
                <p className="text-gray-600">Multiempresa</p>
              </div>
            </div>
          </div>

          <LoginForm />

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              ¿Necesitas ayuda?{' '}
              <a href="mailto:soporte@sistemaventas.com" className="text-blue-600 hover:text-blue-800 font-medium">
                Contacta soporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

