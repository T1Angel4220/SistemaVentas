import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { GlobalSessionAlertContainer } from './components/ui/GlobalSessionAlertContainer';
import { GlobalSuspendedAlertContainer } from './components/ui/GlobalSuspendedAlertContainer';
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
import { ProfilePage } from './pages/ProfilePage';
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
import { ReportsManagementPage } from './pages/ReportsManagementPage';
import { AppealsManagementPage } from './pages/AppealsManagementPage';
import { DangerousProductsHistoryPage } from './pages/DangerousProductsHistoryPage';
// Componentes de error
import { NotFoundPage } from './pages/NotFoundPage';
function App() {
    return (_jsx(AuthProvider, { children: _jsxs(Router, { children: [_jsx(GlobalSessionAlertContainer, {}), _jsx(GlobalSuspendedAlertContainer, {}), _jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx(Navbar, {}), _jsx("main", { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/verify-email", element: _jsx(VerifyEmailPage, {}) }), _jsx(Route, { path: "/verify-code", element: _jsx(VerifyCodePage, {}) }), _jsx(Route, { path: "/forgot-password", element: _jsx(ForgotPasswordPage, {}) }), _jsx(Route, { path: "/reset-password", element: _jsx(ResetPasswordPage, {}) }), _jsx(Route, { path: "/reset-password-code", element: _jsx(ResetPasswordCodePage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/profile", element: _jsx(ProtectedRoute, { children: _jsx(ProfilePage, {}) }) }), _jsx(Route, { path: "/admin/users", element: _jsx(ProtectedRoute, { allowedRoles: ['moderador', 'administrador'], children: _jsx(UserManagementPage, {}) }) }), _jsx(Route, { path: "/admin/sessions/:userId", element: _jsx(ProtectedRoute, { allowedRoles: ['moderador', 'administrador'], children: _jsx(SessionManagementPage, {}) }) }), _jsx(Route, { path: "/admin/register-moderator", element: _jsx(ProtectedRoute, { allowedRoles: ['administrador'], children: _jsx(RegisterModeratorPage, {}) }) }), _jsx(Route, { path: "/admin/*", element: _jsx(ProtectedRoute, { allowedRoles: ['moderador', 'administrador'], children: _jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Panel de Administraci\u00F3n" }), _jsx("p", { className: "text-gray-600", children: "Funcionalidades de administraci\u00F3n en desarrollo..." })] }) }) }) }), _jsx(Route, { path: "/products", element: _jsx(ProductsPage, {}) }), _jsx(Route, { path: "/products/catalog", element: _jsx(ProductsCatalogPage, {}) }), _jsx(Route, { path: "/products/saved", element: _jsx(ProtectedRoute, { allowedRoles: ['comprador', 'vendedor'], children: _jsx(SavedProductsPage, {}) }) }), _jsx(Route, { path: "/products/view/:id", element: _jsx(ProductViewPage, {}) }), _jsx(Route, { path: "/products/contact/:id", element: _jsx(ContactVendorPage, {}) }), _jsx(Route, { path: "/products/:id", element: _jsx(ProductDetailPage, {}) }), _jsx(Route, { path: "/products/create", element: _jsx(ProtectedRoute, { allowedRoles: ['vendedor', 'administrador'], children: _jsx(CreateProductPage, {}) }) }), _jsx(Route, { path: "/products/:id/edit", element: _jsx(ProtectedRoute, { allowedRoles: ['vendedor', 'administrador'], children: _jsx(CreateProductPage, {}) }) }), _jsx(Route, { path: "/my-products", element: _jsx(ProtectedRoute, { allowedRoles: ['vendedor', 'administrador'], children: _jsx(MyProductsPage, {}) }) }), _jsx(Route, { path: "/my-products/dangerous", element: _jsx(ProtectedRoute, { allowedRoles: ['vendedor', 'administrador'], children: _jsx(DangerousProductsHistoryPage, {}) }) }), _jsx(Route, { path: "/products/moderation", element: _jsx(ProtectedRoute, { allowedRoles: ['moderador', 'administrador'], children: _jsx(ProductModerationPage, {}) }) }), _jsx(Route, { path: "/moderation/reports", element: _jsx(ProtectedRoute, { allowedRoles: ['moderador', 'administrador'], children: _jsx(ReportsManagementPage, {}) }) }), _jsx(Route, { path: "/moderation/appeals", element: _jsx(ProtectedRoute, { allowedRoles: ['moderador', 'administrador'], children: _jsx(AppealsManagementPage, {}) }) }), _jsx(Route, { path: "/chat/*", element: _jsx(ProtectedRoute, { children: _jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Chat" }), _jsx("p", { className: "text-gray-600", children: "Sistema de chat en desarrollo..." })] }) }) }) }), _jsx(Route, { path: "/profile", element: _jsx(ProtectedRoute, { children: _jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Perfil de Usuario" }), _jsx("p", { className: "text-gray-600", children: "Gesti\u00F3n de perfil en desarrollo..." })] }) }) }) }), _jsx(Route, { path: "/settings", element: _jsx(ProtectedRoute, { children: _jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Configuraci\u00F3n" }), _jsx("p", { className: "text-gray-600", children: "Configuraci\u00F3n de cuenta en desarrollo..." })] }) }) }) }), _jsx(Route, { path: "*", element: _jsx(NotFoundPage, {}) })] }) })] })] }) }));
}
export default App;
