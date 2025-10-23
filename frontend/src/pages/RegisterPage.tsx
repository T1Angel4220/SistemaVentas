import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ShoppingCart, Shield, Users, MessageCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Si ya está autenticado, redirigir a la página anterior o al dashboard
  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex">
      {/* Panel izquierdo con información */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 flex-col justify-center">
        <div className="max-w-md">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Sistema de Ventas</h1>
              <p className="text-indigo-100">Multiempresa</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            Únete a nuestra comunidad
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Comunidad Confiable</h3>
                <p className="text-indigo-100">Sistema de valoraciones y reputación</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Moderación Inteligente</h3>
                <p className="text-indigo-100">Sistema automático para contenido seguro</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Comunicación Directa</h3>
                <p className="text-indigo-100">Chatea directamente con otros usuarios</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho con formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Logo para móvil */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema de Ventas</h1>
                <p className="text-gray-600">Multiempresa</p>
              </div>
            </div>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

