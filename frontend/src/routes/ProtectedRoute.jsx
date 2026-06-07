/**
 * @file ProtectedRoute.jsx
 * @description Componente de rota protegida para o React Router DOM.
 *
 * Verifica autenticação e permissão de role antes de renderizar a rota filha.
 * Enquanto o contexto de autenticação está sendo reidratado do localStorage,
 * exibe uma tela de carregamento para evitar redirecionamentos prematuros.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente de rota protegida com suporte a controle de acesso por role.
 *
 * Fluxo de decisão:
 * 1. Se `loading` → exibe tela de carregamento
 * 2. Se não autenticado → redireciona para `/auth`
 * 3. Se `allowedRoles` definido e role do usuário não incluída → redireciona para `/`
 * 4. Caso contrário → renderiza `<Outlet />` (rota filha)
 *
 * @param {{ allowedRoles?: string[] }} props
 * @param {string[]} [props.allowedRoles] - Roles permitidas para acessar a rota (ex: ["Cliente"]).
 *   Se omitido, qualquer usuário autenticado tem acesso.
 * @returns {JSX.Element}
 *
 * @example
 * // Apenas clientes acessam /client-dashboard
 * { element: <ProtectedRoute allowedRoles={["Cliente"]} />, children: [...] }
 */
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
