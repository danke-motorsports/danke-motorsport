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
        backgroundColor: '#1B1B1B',
        color: '#FFFFFF',
        fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
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
