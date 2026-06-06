import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ allowedRoles }) {
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
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '500',
          letterSpacing: '1px'
        }}>
          Carregando...
        </div>
      </div>
    );
  }

  // Se não estiver logado, vai para a página de Login/Cadastro
  if (!signed) {
    return <Navigate to="/auth" replace />;
  }

  // Se a rota tem restrição de perfil (role) e o usuário não possui a permissão
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Renderiza a rota filha
  return <Outlet />;
}
