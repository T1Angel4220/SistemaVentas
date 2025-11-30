import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  ShoppingCart, 
  Package, 
  Shield, 
  Users, 
  Star,
  ArrowRight,
  Eye
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mejorado para móvil */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Sistema de Ventas Multiempresa
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-blue-100 px-4">
              La plataforma más completa para comprar y vender productos y servicios
            </p>
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                <Link to="/products" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100">
                    <Eye className="mr-2 h-5 w-5" />
                    Ver Productos
                  </Button>
                </Link>
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
                    Comenzar Ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100">
                    Ir al Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section - Mejorado para móvil */}
      <div className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              ¿Por qué elegir nuestro sistema?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">
              Ofrecemos las mejores herramientas para compradores y vendedores
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Link 
              to={!isAuthenticated ? "/register" : "/products"} 
              className="block group"
            >
              <Card className="text-center h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-blue-200">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Comprar Fácil</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Encuentra productos y servicios de calidad con solo unos clics
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link 
              to={!isAuthenticated ? "/register" : "/products/create"} 
              className="block group"
            >
              <Card className="text-center h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-green-200">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors duration-300">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Vender Seguro</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Publica tus productos y servicios con total seguridad
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link 
              to={!isAuthenticated ? "/register" : "/dashboard"} 
              className="block group"
            >
              <Card className="text-center h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-yellow-200">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors duration-300">
                    <Shield className="h-6 w-6 text-yellow-600" />
                  </div>
                  <CardTitle>Moderación Inteligente</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Sistema de moderación automática para contenido seguro
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link 
              to={!isAuthenticated ? "/register" : "/products"} 
              className="block group"
            >
              <Card className="text-center h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-red-200">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors duration-300">
                    <Users className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle>Comunidad Confiable</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Sistema de valoraciones y reputación para usuarios
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link 
              to={!isAuthenticated ? "/register" : "/dashboard"} 
              className="block group"
            >
              <Card className="text-center h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-indigo-200">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors duration-300">
                    <Star className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle>Experiencia Premium</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Interfaz intuitiva y fácil de usar para todos
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section - Mejorado para móvil */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Números que hablan
            </h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">
              Miles de usuarios confían en nuestra plataforma
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <Link 
              to={!isAuthenticated ? "/register" : "/dashboard"}
              className="text-center p-4 rounded-xl hover:bg-blue-50 transition-all duration-300 hover:scale-105 cursor-pointer group"
            >
              <div className="text-4xl font-bold text-blue-600 mb-2 group-hover:text-blue-700 transition-colors">1000+</div>
              <div className="text-gray-600 group-hover:text-gray-900 font-medium transition-colors">Usuarios Activos</div>
              {!isAuthenticated && (
                <div className="mt-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Únete ahora →
                </div>
              )}
            </Link>
            <Link 
              to={!isAuthenticated ? "/register" : "/products"}
              className="text-center p-4 rounded-xl hover:bg-green-50 transition-all duration-300 hover:scale-105 cursor-pointer group"
            >
              <div className="text-4xl font-bold text-green-600 mb-2 group-hover:text-green-700 transition-colors">5000+</div>
              <div className="text-gray-600 group-hover:text-gray-900 font-medium transition-colors">Productos Publicados</div>
              {!isAuthenticated && (
                <div className="mt-2 text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver productos →
                </div>
              )}
            </Link>
            <Link 
              to={!isAuthenticated ? "/register" : "/products"}
              className="text-center p-4 rounded-xl hover:bg-purple-50 transition-all duration-300 hover:scale-105 cursor-pointer group"
            >
              <div className="text-4xl font-bold text-purple-600 mb-2 group-hover:text-purple-700 transition-colors">10000+</div>
              <div className="text-gray-600 group-hover:text-gray-900 font-medium transition-colors">Transacciones Exitosas</div>
              {!isAuthenticated && (
                <div className="mt-2 text-xs text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Empieza a vender →
                </div>
              )}
            </Link>
            <Link 
              to={!isAuthenticated ? "/register" : "/dashboard"}
              className="text-center p-4 rounded-xl hover:bg-yellow-50 transition-all duration-300 hover:scale-105 cursor-pointer group"
            >
              <div className="text-4xl font-bold text-yellow-600 mb-2 group-hover:text-yellow-700 transition-colors">99%</div>
              <div className="text-gray-600 group-hover:text-gray-900 font-medium transition-colors">Satisfacción del Cliente</div>
              {!isAuthenticated && (
                <div className="mt-2 text-xs text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Forma parte →
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section - Mejorado para móvil */}
      <div className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 px-4">
            Únete a nuestra comunidad y descubre nuevas oportunidades
          </p>
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link to="/products" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                  <Eye className="mr-2 h-5 w-5" />
                  Ver Productos
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                  Crear Cuenta Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-gray-900">
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
          ) : (
            <Link to="/dashboard" className="inline-block">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Ir al Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 Sistema de Ventas Multiempresa. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

