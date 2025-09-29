import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RegisterForm } from '../components/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Ventas
          </h1>
          <p className="text-gray-600">
            Multiempresa
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterForm />
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Al registrarte, aceptas nuestros{' '}
          <a href="/terms" className="text-blue-600 hover:text-blue-800">
            Términos de Servicio
          </a>{' '}
          y{' '}
          <a href="/privacy" className="text-blue-600 hover:text-blue-800">
            Política de Privacidad
          </a>
        </p>
      </div>
    </div>
  );
};

