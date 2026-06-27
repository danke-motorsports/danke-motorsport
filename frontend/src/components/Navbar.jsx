import { Link } from "react-router-dom";
import { FaWrench } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import DashboardUserMenu from "./DashboardUserMenu";
import "./Navbar.css";

function getRoleLabel(role) {
  if (role === "Cliente") return "Cliente";
  if (role === "Funcionario") return "Funcionário";
  return "Administrador";
}

/**
 * Navbar unificada da aplicação.
 *
 * @param {'public' | 'dashboard'} variant - Modo público (landing) ou autenticado (dashboards).
 * @param {string} [title] - Título exibido no modo dashboard.
 * @param {string} [roleLabel] - Rótulo do perfil do usuário; inferido automaticamente se omitido.
 * @param {'client' | 'employee' | 'admin' | 'profile'} [iconTheme] - Cor do ícone no modo dashboard.
 * @param {string} [className] - Classes CSS adicionais para o header dashboard.
 */
function Navbar({
  variant = "public",
  title = "Danke Motorsport",
  roleLabel,
  iconTheme = "client",
  className = "",
}) {
  const { user } = useAuth();

  if (variant === "dashboard") {
    const resolvedRoleLabel = roleLabel ?? getRoleLabel(user?.role);

    return (
      <header
        className={`dashboard-header navbar-icon-${iconTheme} ${className}`.trim()}
      >
        <div className="logo-container">
          <h1>{title}</h1>
        </div>
        <DashboardUserMenu roleLabel={resolvedRoleLabel} />
      </header>
    );
  }

  return (
    <nav className="container-navbar">
      <div className="container-logo">
        <Link to="/">
          <img
            src="/images/dankelogo-auth.png"
            alt="Logo Danke Motorsport"
            className="logo-navbar"
          />
        </Link>
      </div>
      <div className="container-secoes-navbar">
        <Link to="/sobre">SOBRE NÓS</Link>
      </div>
      <div className="navbar-auth">
        <Link to="/auth">
          <button type="button" className="botao-auth-navbar">
            ENTRAR
          </button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
