import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardPath } from '../utils/authRoutes';

export function GuestRoute() {
  const { signed, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0a0a0c',
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '500',
          letterSpacing: '1px',
        }}>
          Carregando...
        </div>
      </div>
    );
  }

  if (signed && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <Outlet />;
}
