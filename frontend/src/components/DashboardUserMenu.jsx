import { Link } from 'react-router-dom';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import './DashboardUserMenu.css';

function DashboardUserMenu({ roleLabel }) {
  const { user, logout } = useAuth();

  return (
    <div className="user-profile">
      <span className="user-greeting">
        Olá, <strong>{user?.nome}</strong> ({roleLabel})
      </span>
      <div className="user-actions">
        <Link to="/perfil" className="profile-avatar-btn" title="Meu perfil">
          <FaUserCircle className="profile-avatar-icon" />
        </Link>
        <button className="logout-button" onClick={logout} title="Sair da Conta">
          <FaSignOutAlt /> Sair
        </button>
      </div>
    </div>
  );
}

export default DashboardUserMenu;
