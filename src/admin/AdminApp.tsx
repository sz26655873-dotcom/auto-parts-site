/**
 * AdminApp — route configuration for the admin backend.
 *
 * Defines nested routes for all admin pages. Protected routes are wrapped
 * in <ProtectedRoute> which checks authentication, and <AdminLayout>
 * provides the sidebar + top bar chrome. The login page is a standalone
 * route without the layout.
 *
 * Route structure:
 *   /admin                → LoginPage (standalone)
 *   /admin/dashboard      → Dashboard (protected, in layout)
 *   /admin/products       → ProductManager (protected, in layout)
 *   /admin/contact        → ContactManager (protected, in layout)
 *   /admin/company        → CompanyManager (protected, in layout)
 *   /admin/data           → DataManager (protected, in layout)
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from './AdminLayout';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import ProductManager from './ProductManager';
import ContactManager from './ContactManager';
import CompanyManager from './CompanyManager';
import DataManager from './DataManager';

/**
 * Renders the admin route tree. Should be mounted inside the main
 * <Routes> in App.tsx under the /admin/* path.
 *
 * IMPORTANT: Because this component is rendered by a parent
 * <Route path="/admin/*">, all paths here are RELATIVE to /admin.
 * Using absolute paths (e.g. "/admin/dashboard") in a descendant
 * <Routes> causes route matching to fail in React Router v6,
 * resulting in a blank page.
 */
function AdminApp(): JSX.Element {
  return (
    <Routes>
      {/* Login page — no layout, no auth required.
          `index` matches when the URL is exactly /admin (empty splat). */}
      <Route index element={<LoginPage />} />

      {/* Protected admin pages with layout.
          Paths are relative to the parent /admin match. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="contact" element={<ContactManager />} />
          <Route path="company" element={<CompanyManager />} />
          <Route path="data" element={<DataManager />} />
        </Route>
      </Route>

      {/* Fallback: redirect unknown admin paths to login */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default AdminApp;
