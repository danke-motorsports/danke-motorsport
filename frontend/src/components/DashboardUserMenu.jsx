import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import './DashboardUserMenu.css';

function DashboardUserMenu({ roleLabel }) {
  const { user, logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="user-profile">
      <span className="user-greeting">
        Olá, <strong>{user?.nome}</strong> ({roleLabel})
      </span>
      <div className="user-actions">
        <Link to="/perfil" className="profile-avatar-btn" title="Meu perfil">
          <FaUserCircle className="profile-avatar-icon" />
        </Link>
        <button className="logout-button" onClick={() => setShowConfirm(true)} title="Sair da Conta">
          <FaSignOutAlt /> Sair
        </button>
      </div>

      {showConfirm && (
        <div className="modal-backdrop">
          <div className="modal-container logout-modal-container glass-card">
            <div className="modal-header logout-modal-header">
              <h3>Confirmar Saída</h3>
            </div>
            <div className="logout-modal-body">
              <p>Deseja realmente sair da sua conta?</p>
            </div>
            <div className="logout-modal-footer">
              <button className="btn-cancel" onClick={() => setShowConfirm(false)}>
                Cancelar
              </button>
              <button className="btn-submit" onClick={logout}>
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardUserMenu;
