import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Páginas
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { VerifyCodePage } from './pages/VerifyCodePage';
import { DashboardPage } from './pages/DashboardPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { RegisterModeratorPage } from './pages/RegisterModeratorPage';

// Componentes de error
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/verify-code" element={<VerifyCodePage />} />
              
              {/* Rutas protegidas */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rutas de administración (solo para moderadores y administradores) */}
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute allowedRoles={['moderador', 'administrador']}>
                    <UserManagementPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/register-moderator" 
                element={
                  <ProtectedRoute allowedRoles={['administrador']}>
                    <RegisterModeratorPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute allowedRoles={['moderador', 'administrador']}>
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                          Panel de Administración
                        </h2>
                        <p className="text-gray-600">
                          Funcionalidades de administración en desarrollo...
                        </p>
                      </div>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              {/* Rutas de productos */}
              <Route 
                path="/products/*" 
                element={
                  <ProtectedRoute>
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                          Productos
                        </h2>
                        <p className="text-gray-600">
                          Catálogo de productos en desarrollo...
                        </p>
                      </div>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              {/* Rutas de chat */}
              <Route 
                path="/chat/*" 
                element={
                  <ProtectedRoute>
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                          Chat
                        </h2>
                        <p className="text-gray-600">
                          Sistema de chat en desarrollo...
                        </p>
                      </div>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              {/* Rutas de perfil */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                          Perfil de Usuario
                        </h2>
                        <p className="text-gray-600">
                          Gestión de perfil en desarrollo...
                        </p>
                      </div>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              {/* Rutas de configuración */}
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                          Configuración
                        </h2>
                        <p className="text-gray-600">
                          Configuración de cuenta en desarrollo...
                        </p>
                      </div>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              {/* Ruta 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;