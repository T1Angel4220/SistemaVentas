import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Páginas
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { VerifyCodePage } from './pages/VerifyCodePage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ResetPasswordCodePage } from './pages/ResetPasswordCodePage';
import { DashboardPage } from './pages/DashboardPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { RegisterModeratorPage } from './pages/RegisterModeratorPage';
import { SessionManagementPage } from './pages/SessionManagementPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ProductViewPage } from './pages/ProductViewPage';
import { ProductsCatalogPage } from './pages/ProductsCatalogPage';
import { ContactVendorPage } from './pages/ContactVendorPage';
import { CreateProductPage } from './pages/CreateProductPage';
import { MyProductsPage } from './pages/MyProductsPage';
import { ProductModerationPage } from './pages/ProductModerationPage';
import { SavedProductsPage } from './pages/SavedProductsPage';

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
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/reset-password-code" element={<ResetPasswordCodePage />} />
              
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
                path="/admin/sessions/:userId" 
                element={
                  <ProtectedRoute allowedRoles={['moderador', 'administrador']}>
                    <SessionManagementPage />
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
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/catalog" element={<ProductsCatalogPage />} />
              <Route 
                path="/products/saved" 
                element={
                  <ProtectedRoute allowedRoles={['comprador']}>
                    <SavedProductsPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/products/view/:id" element={<ProductViewPage />} />
              <Route 
                path="/products/contact/:id" 
                element={<ContactVendorPage />}
              />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route 
                path="/products/create" 
                element={
                  <ProtectedRoute allowedRoles={['vendedor', 'administrador']}>
                    <CreateProductPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/products/:id/edit" 
                element={
                  <ProtectedRoute allowedRoles={['vendedor', 'administrador']}>
                    <CreateProductPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-products" 
                element={
                  <ProtectedRoute allowedRoles={['vendedor', 'administrador']}>
                    <MyProductsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/products/moderation" 
                element={
                  <ProtectedRoute allowedRoles={['moderador', 'administrador']}>
                    <ProductModerationPage />
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