/**
 * Route guard for admin pages.
 *
 * Checks sessionStorage for the authentication flag. If the user is not
 * authenticated, redirects to the login page (/admin). Otherwise renders
 * the child routes via <Outlet />.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from './adminStorage';

/**
 * Protects nested admin routes. Unauthenticated users are redirected
 * to /admin (the login page).
 */
function ProtectedRoute(): JSX.Element {
  const authed = isAuthenticated();

  if (!authed) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
