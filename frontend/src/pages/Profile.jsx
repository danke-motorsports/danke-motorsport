import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IMaskInput } from 'react-imask';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import DashboardUserMenu from '../components/DashboardUserMenu';
import {
  FaWrench, FaUser, FaEnvelope, FaIdCard, FaPhoneAlt, FaCar,
  FaKey, FaBriefcase, FaArrowLeft, FaRegEye, FaRegEyeSlash
} from 'react-icons/fa';
import './Profile.css';

const CARGO_LABELS = {
  1: 'Técnico / Mecânico',
  2: 'Supervisor',
  3: 'Gerente',
};

function getDashboardPath(role) {
  if (role === 'Cliente') return '/client-dashboard';
  if (role === 'Funcionario') return '/employee-dashboard';
  return '/admin-dashboard';
}

function getRoleLabel(role) {
  if (role === 'Cliente') return 'Cliente';
  if (role === 'Funcionario') return 'Funcionário';
  return 'Administrador';
}

function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    placaVeiculo: '',
    senha: '',
    confirmarSenha: '',
    tipoFuncionario: 2,
    cargo: 1,
  });

  const isCliente = user?.role === 'Cliente';
  const isStaff = user?.role === 'Funcionario' || user?.role === 'Admin';

  useEffect(() => {
    if (!user) return;

    const carregarPerfil = async () => {
      try {
        setLoading(true);
        if (isCliente) {
          const { data } = await api.get(`/danke/clientes/${user.id}`);
          setFormData((prev) => ({
            ...prev,
            nome: data.nome || '',
            email: data.email || '',
            cpf: data.cpf || '',
            telefone: data.telefone || '',
            placaVeiculo: data.placaVeiculo || '',
          }));
        } else if (isStaff) {
          const { data } = await api.get(`/danke/funcionarios/${user.id}`);
          setFormData((prev) => ({
            ...prev,
            nome: data.nomeFuncionario || '',
            email: data.email || '',
            tipoFuncionario: data.tipoFuncionario ?? 2,
            cargo: data.cargo ?? 1,
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        toast.error('Não foi possível carregar seus dados.');
      } finally {
        setLoading(false);
      }
    };

    carregarPerfil();
  }, [user, isCliente, isStaff]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMaskedChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.senha && formData.senha !== formData.confirmarSenha) {
      toast.error('As senhas não coincidem.');
      return;
    }

    if (formData.senha && formData.senha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      setSaving(true);

      if (isCliente) {
        const payload = {
          nome: formData.nome,
          email: formData.email,
          cpf: formData.cpf,
          telefone: formData.telefone,
          placaVeiculo: formData.placaVeiculo,
        };
        if (formData.senha) payload.senha = formData.senha;

        const { data } = await api.put(`/danke/clientes/${user.id}`, payload);
        updateUser({ ...user, nome: data.nome, email: data.email });
      } else if (isStaff) {
        const payload = {
          nomeFuncionario: formData.nome,
          email: formData.email,
        };
        if (formData.senha) payload.senha = formData.senha;

        const { data } = await api.put(`/danke/funcionarios/${user.id}`, payload);
        updateUser({ ...user, nome: data.nomeFuncionario, email: data.email });
        setFormData((prev) => ({
          ...prev,
          tipoFuncionario: data.tipoFuncionario,
          cargo: data.cargo,
        }));
      }

      toast.success('Perfil atualizado com sucesso!');
      setFormData((prev) => ({ ...prev, senha: '', confirmarSenha: '' }));
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      const data = error.response?.data;
      const validationErrors = data?.errors
        ? Object.values(data.errors).flat().join(' ')
        : null;
      const msg = data?.message || validationErrors || 'Erro ao salvar alterações.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <header className="dashboard-header profile-header">
        <div className="logo-container">
          <FaWrench className="header-icon" />
          <h1>Meu Perfil</h1>
        </div>
        <DashboardUserMenu roleLabel={getRoleLabel(user.role)} />
      </header>

      <main className="profile-main">
        <Link to={getDashboardPath(user.role)} className="profile-back-link">
          <FaArrowLeft /> Voltar ao painel
        </Link>

        {loading ? (
          <div className="profile-loading">Carregando seus dados...</div>
        ) : (
          <section className="profile-card glass-card">
            <div className="profile-card-header">
              <div className="profile-avatar-large">
                <FaUser />
              </div>
              <div>
                <h2>{formData.nome || user.nome}</h2>
                <p>{formData.email}</p>
              </div>
            </div>

            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="profile-form-group">
                <label><FaUser /> Nome</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label><FaEnvelope /> E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {isCliente && (
                <>
                  <div className="profile-form-group">
                    <label><FaIdCard /> CPF</label>
                    <IMaskInput
                      name="cpf"
                      className="profile-input"
                      mask="000.000.000-00"
                      value={formData.cpf}
                      onAccept={(value) => handleMaskedChange('cpf', value)}
                      inputMode="numeric"
                      required
                    />
                  </div>

                  <div className="profile-form-group">
                    <label><FaPhoneAlt /> Telefone</label>
                    <IMaskInput
                      name="telefone"
                      className="profile-input"
                      mask={[
                        { mask: '(00) 0000-0000' },
                        { mask: '(00) 00000-0000' },
                      ]}
                      value={formData.telefone}
                      onAccept={(value) => handleMaskedChange('telefone', value)}
                      inputMode="tel"
                      required
                    />
                  </div>

                  <div className="profile-form-group">
                    <label><FaCar /> Placa do veículo</label>
                    <input
                      type="text"
                      name="placaVeiculo"
                      value={formData.placaVeiculo}
                      onChange={handleChange}
                      placeholder="ABC-1D23"
                    />
                  </div>
                </>
              )}

              {isStaff && (
                <>
                  <div className="profile-form-group">
                    <label><FaBriefcase /> Tipo de acesso</label>
                    <input
                      type="text"
                      value={formData.tipoFuncionario === 1 ? 'Administrador' : 'Funcionário'}
                      readOnly
                      className="profile-readonly"
                    />
                  </div>

                  <div className="profile-form-group">
                    <label>Cargo</label>
                    <input
                      type="text"
                      value={CARGO_LABELS[formData.cargo] || `Nível ${formData.cargo}`}
                      readOnly
                      className="profile-readonly"
                    />
                    <span className="profile-hint">Cargo e tipo de acesso só podem ser alterados por um administrador.</span>
                  </div>
                </>
              )}

              <div className="profile-form-divider" />

              <div className="profile-form-group">
                <label><FaKey /> Nova senha (opcional)</label>
                <div className="profile-password-wrap">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    placeholder="Deixe em branco para manter a atual"
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="profile-toggle-senha"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {mostrarSenha ? <FaRegEye /> : <FaRegEyeSlash />}
                  </button>
                </div>
              </div>

              <div className="profile-form-group">
                <label><FaKey /> Confirmar nova senha</label>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  placeholder="Repita a nova senha"
                />
              </div>

              <div className="profile-form-actions">
                <button
                  type="button"
                  className="btn-profile-cancel"
                  onClick={() => navigate(getDashboardPath(user.role))}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-profile-save" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

export default Profile;
