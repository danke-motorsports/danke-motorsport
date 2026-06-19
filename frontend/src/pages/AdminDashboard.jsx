import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import DashboardUserMenu from '../components/DashboardUserMenu';
import './AdminDashboard.css';
import { 
  FaWrench, FaPlus, FaTrash, FaEdit, 
  FaUser, FaUsers, FaBriefcase, FaCalendarAlt, 
  FaCar, FaKey, FaEnvelope, FaPhoneAlt, FaIdCard, FaTimes 
} from 'react-icons/fa';

function AdminDashboard() {
  const { user } = useAuth();
  
  // States para os dados
  const [clientes, setClientes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [revisoes, setRevisoes] = useState([]);
  
  // Status de carregamento e mensagens
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Controle de Tabs: 'revisoes', 'clientes', 'funcionarios'
  const [activeTab, setActiveTab] = useState('revisoes');
  
  // Controle de Modais
  const [modalType, setModalType] = useState(null); // 'createFuncionario', 'editCliente', 'editFuncionario', 'editRevisao'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      
      const [resClientes, resFuncionarios, resRevisoes] = await Promise.all([
        api.get('/danke/clientes'),
        api.get('/danke/funcionarios'),
        api.get('/danke/revisao')
      ]);

      setClientes(resClientes.data);
      setFuncionarios(resFuncionarios.data);
      setRevisoes(resRevisoes.data);
    } catch (error) {
      console.error('Erro ao carregar dados do admin:', error);
      setErrorMsg('Não foi possível carregar os dados. Verifique a conexão com a API.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  // CRUD DELETES
  const handleDeleteCliente = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja remover o cliente "${nome}"? Todas as revisões associadas também poderão ser afetadas.`)) return;
    try {
      await api.delete(`/danke/clientes/${id}`);
      showSuccess(`Cliente "${nome}" removido com sucesso.`);
      carregarDados();
    } catch (error) {
      console.error(error);
      showError('Erro ao deletar cliente.');
    }
  };

  const handleDeleteFuncionario = async (id, nome) => {
    if (id === user?.id) {
      showError('Você não pode remover a si mesmo!');
      return;
    }
    if (!window.confirm(`Tem certeza que deseja remover o funcionário "${nome}"?`)) return;
    try {
      await api.delete(`/danke/funcionarios/${id}`);
      showSuccess(`Funcionário "${nome}" removido com sucesso.`);
      carregarDados();
    } catch (error) {
      console.error(error);
      showError('Erro ao deletar funcionário.');
    }
  };

  const handleDeleteRevisao = async (id) => {
    if (!window.confirm(`Tem certeza que deseja cancelar/remover a revisão #${id}?`)) return;
    try {
      await api.delete(`/danke/revisao/${id}`);
      showSuccess(`Revisão #${id} removida com sucesso.`);
      carregarDados();
    } catch (error) {
      console.error(error);
      showError('Erro ao deletar revisão.');
    }
  };

  // MODAIS OPENERS
  const openCreateFuncionario = () => {
    setFormData({
      nomeFuncionario: '',
      email: '',
      senha: '',
      tipoFuncionario: 2, // Default: normal
      cargo: 1 // Default cargo
    });
    setModalType('createFuncionario');
  };

  const openEditCliente = (cliente) => {
    setSelectedItem(cliente);
    setFormData({
      nome: cliente.nome,
      email: cliente.email,
      cpf: cliente.cpf,
      telefone: cliente.telefone,
      placaVeiculo: cliente.placaVeiculo || ''
    });
    setModalType('editCliente');
  };

  const openEditFuncionario = (func) => {
    setSelectedItem(func);
    setFormData({
      nomeFuncionario: func.nomeFuncionario,
      email: func.email,
      tipoFuncionario: func.tipoFuncionario,
      cargo: func.cargo,
      senha: '' // Deixar em branco se não quiser alterar
    });
    setModalType('editFuncionario');
  };

  const openEditRevisao = (rev) => {
    setSelectedItem(rev);
    // Formatar data para o input datetime-local (YYYY-MM-DDTHH:MM)
    let formattedDate = '';
    if (rev.datAgendamento) {
      const d = new Date(rev.datAgendamento);
      // Ajustar timezone local
      const offset = d.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
      formattedDate = localISOTime;
    }

    setFormData({
      tipoRevisao: rev.tipoRevisao,
      statusRevisao: rev.statusRevisao,
      datAgendamento: formattedDate,
      idCliente: rev.idCliente,
      idFuncionario: rev.idFuncionario || 0,
      observacaoCliente: rev.observacaoCliente || '',
      feedbackMecanico: rev.feedbackMecanico || ''
    });
    setModalType('editRevisao');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedItem(null);
    setFormData({});
  };

  // FORM SUBMITS
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'createFuncionario') {
        await api.post('/danke/funcionarios', {
          nomeFuncionario: formData.nomeFuncionario,
          email: formData.email,
          senha: formData.senha,
          tipoFuncionario: parseInt(formData.tipoFuncionario),
          cargo: parseInt(formData.cargo)
        });
        showSuccess('Funcionário cadastrado com sucesso!');
      } 
      else if (modalType === 'editCliente') {
        await api.put(`/danke/clientes/${selectedItem.id}`, formData);
        showSuccess('Dados do cliente atualizados!');
      } 
      else if (modalType === 'editFuncionario') {
        await api.put(`/danke/funcionarios/${selectedItem.idFuncionario}`, {
          nomeFuncionario: formData.nomeFuncionario,
          email: formData.email,
          tipoFuncionario: parseInt(formData.tipoFuncionario),
          cargo: parseInt(formData.cargo),
          senha: formData.senha || undefined // Envia apenas se preenchido
        });
        showSuccess('Dados do funcionário atualizados!');
      } 
      else if (modalType === 'editRevisao') {
        await api.put(`/danke/revisao/${selectedItem.idRevisao}`, {
          tipoRevisao: parseInt(formData.tipoRevisao),
          statusRevisao: formData.statusRevisao,
          datAgendamento: new Date(formData.datAgendamento).toISOString(),
          idCliente: parseInt(formData.idCliente),
          idFuncionario: parseInt(formData.idFuncionario) === 0 ? null : parseInt(formData.idFuncionario),
          observacaoCliente: formData.observacaoCliente?.trim() || null,
          feedbackMecanico: formData.feedbackMecanico?.trim() || null
        });
        showSuccess('Revisão atualizada com sucesso!');
      }
      closeModal();
      carregarDados();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Erro ao salvar alterações. Verifique os campos.';
      showError(msg);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // HELPERS
  const getTipoRevisaoLabel = (tipo) => {
    switch (tipo) {
      case 1: return { name: 'Bronze', class: 'badge-bronze' };
      case 2: return { name: 'Silver', class: 'badge-silver' };
      case 3: return { name: 'Gold', class: 'badge-gold' };
      default: return { name: 'N/A', class: '' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Pendente': return 'status-pendente';
      case 'Em Andamento': return 'status-andamento';
      case 'Concluído': return 'status-concluido';
      default: return '';
    }
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="admin-dashboard-container">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="logo-container">
          <FaWrench className="header-icon" />
          <h1>Painel Administrativo</h1>
        </div>
        <DashboardUserMenu roleLabel="Administrador" />
      </header>

      {/* ALERTAS */}
      {successMsg && <div className="admin-alert success">{successMsg}</div>}
      {errorMsg && <div className="admin-alert error">{errorMsg}</div>}

      {/* STATS CARDS */}
      <div className="admin-stats-grid">
        <div className="stat-card glass-card" onClick={() => setActiveTab('revisoes')}>
          <div className="stat-info">
            <h3>Revisões</h3>
            <p className="stat-number">{revisoes.length}</p>
          </div>
          <FaCalendarAlt className="stat-icon" />
        </div>
        <div className="stat-card glass-card" onClick={() => setActiveTab('clientes')}>
          <div className="stat-info">
            <h3>Clientes</h3>
            <p className="stat-number">{clientes.length}</p>
          </div>
          <FaUsers className="stat-icon" />
        </div>
        <div className="stat-card glass-card" onClick={() => setActiveTab('funcionarios')}>
          <div className="stat-info">
            <h3>Funcionários</h3>
            <p className="stat-number">{funcionarios.length}</p>
          </div>
          <FaBriefcase className="stat-icon" />
        </div>
      </div>

      {/* TABS DE SELEÇÃO */}
      <div className="admin-tabs-nav">
        <button 
          className={`tab-nav-btn ${activeTab === 'revisoes' ? 'active' : ''}`}
          onClick={() => setActiveTab('revisoes')}
        >
          <FaCalendarAlt /> Revisões
        </button>
        <button 
          className={`tab-nav-btn ${activeTab === 'clientes' ? 'active' : ''}`}
          onClick={() => setActiveTab('clientes')}
        >
          <FaUsers /> Clientes
        </button>
        <button 
          className={`tab-nav-btn ${activeTab === 'funcionarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('funcionarios')}
        >
          <FaBriefcase /> Funcionários
        </button>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="admin-main-content">
        {loading ? (
          <div className="admin-loading">Carregando painel de dados...</div>
        ) : (
          <section className="admin-table-section glass-card">
            <div className="table-header">
              <h2>
                {activeTab === 'revisoes' && 'Gerenciamento de Revisões'}
                {activeTab === 'clientes' && 'Gerenciamento de Clientes'}
                {activeTab === 'funcionarios' && 'Gerenciamento de Funcionários'}
              </h2>
              {activeTab === 'funcionarios' && (
                <button className="btn-add-funcionario" onClick={openCreateFuncionario}>
                  <FaPlus /> Cadastrar Funcionário
                </button>
              )}
            </div>

            {/* LISTA DE REVISÕES */}
            {activeTab === 'revisoes' && (
              revisoes.length === 0 ? (
                <div className="empty-state">Nenhuma revisão cadastrada.</div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Placa</th>
                        <th>Plano</th>
                        <th>Agendado Para</th>
                        <th>Responsável</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revisoes.map((rev) => {
                        const tier = getTipoRevisaoLabel(rev.tipoRevisao);
                        return (
                          <Fragment key={rev.idRevisao}>
                            <tr>
                              <td className="col-id">#{rev.idRevisao}</td>
                              <td>{rev.cliente?.nome || `ID Client: ${rev.idCliente}`}</td>
                              <td><span className="car-plate-badge"><FaCar /> {rev.cliente?.placaVeiculo || 'N/D'}</span></td>
                              <td><span className={`tier-badge ${tier.class}`}>{tier.name}</span></td>
                              <td>{formatarData(rev.datAgendamento)}</td>
                              <td>{rev.funcionario?.nomeFuncionario || <span className="no-assignment">Não Atribuído</span>}</td>
                              <td>
                                <span className={`status-badge ${getStatusLabel(rev.statusRevisao)}`}>
                                  {rev.statusRevisao}
                                </span>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button className="btn-action edit" onClick={() => openEditRevisao(rev)} title="Editar"><FaEdit /></button>
                                  <button className="btn-action delete" onClick={() => handleDeleteRevisao(rev.idRevisao)} title="Excluir"><FaTrash /></button>
                                </div>
                              </td>
                            </tr>
                            {(rev.observacaoCliente || rev.feedbackMecanico) && (
                              <tr className="detail-row">
                                <td colSpan="8">
                                  <div className="detail-container">
                                    {rev.observacaoCliente && (
                                      <div className="detail-block">
                                        <strong>Obs. do Cliente:</strong> "{rev.observacaoCliente}"
                                      </div>
                                    )}
                                    {rev.feedbackMecanico && (
                                      <div className="detail-block mechanic-feedback">
                                        <strong>Feedback do Mecânico:</strong> "{rev.feedbackMecanico}"
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* LISTA DE CLIENTES */}
            {activeTab === 'clientes' && (
              clientes.length === 0 ? (
                <div className="empty-state">Nenhum cliente cadastrado.</div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>CPF</th>
                        <th>Telefone</th>
                        <th>Placa Veículo</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.map((cli) => (
                        <tr key={cli.id}>
                          <td className="col-id">#{cli.id}</td>
                          <td><strong>{cli.nome}</strong></td>
                          <td>{cli.email}</td>
                          <td>{cli.cpf}</td>
                          <td>{cli.telefone}</td>
                          <td><span className="car-plate-badge"><FaCar /> {cli.placaVeiculo || 'N/D'}</span></td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-action edit" onClick={() => openEditCliente(cli)} title="Editar"><FaEdit /></button>
                              <button className="btn-action delete" onClick={() => handleDeleteCliente(cli.id, cli.nome)} title="Excluir"><FaTrash /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* LISTA DE FUNCIONÁRIOS */}
            {activeTab === 'funcionarios' && (
              funcionarios.length === 0 ? (
                <div className="empty-state">Nenhum funcionário cadastrado.</div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Tipo</th>
                        <th>Cargo</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {funcionarios.map((func) => (
                        <tr key={func.idFuncionario}>
                          <td className="col-id">#{func.idFuncionario}</td>
                          <td><strong>{func.nomeFuncionario}</strong></td>
                          <td>{func.email}</td>
                          <td>
                            <span className={`role-tag ${func.tipoFuncionario === 1 ? 'admin' : 'employee'}`}>
                              {func.tipoFuncionario === 1 ? 'Administrador' : 'Funcionário'}
                            </span>
                          </td>
                          <td>{func.cargo === 1 ? 'Técnico/Mecânico' : `Nível ${func.cargo}`}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-action edit" onClick={() => openEditFuncionario(func)} title="Editar"><FaEdit /></button>
                              <button 
                                className="btn-action delete" 
                                onClick={() => handleDeleteFuncionario(func.idFuncionario, func.nomeFuncionario)} 
                                disabled={func.idFuncionario === user?.id}
                                title={func.idFuncionario === user?.id ? 'Você não pode remover a si mesmo' : 'Excluir'}
                              ><FaTrash /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </section>
        )}
      </main>

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      {modalType && (
        <div className="modal-backdrop">
          <div className="modal-container glass-card">
            <div className="modal-header">
              <h3>
                {modalType === 'createFuncionario' && 'Cadastrar Novo Funcionário'}
                {modalType === 'editCliente' && 'Editar Cliente'}
                {modalType === 'editFuncionario' && 'Editar Funcionário'}
                {modalType === 'editRevisao' && 'Editar Detalhes da Revisão'}
              </h3>
              <button className="modal-close" onClick={closeModal}><FaTimes /></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="modal-form">
              {/* FORMULÁRIO: CADASTRAR FUNCIONÁRIO */}
              {modalType === 'createFuncionario' && (
                <>
                  <div className="modal-form-group">
                    <label><FaUser /> Nome Completo</label>
                    <input 
                      type="text" 
                      name="nomeFuncionario" 
                      value={formData.nomeFuncionario || ''} 
                      onChange={handleInputChange} 
                      placeholder="Nome do Funcionário" 
                      required 
                    />
                  </div>
                  <div className="modal-form-group">
                    <label><FaEnvelope /> Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email || ''} 
                      onChange={handleInputChange} 
                      placeholder="email@danke.com" 
                      required 
                    />
                  </div>
                  <div className="modal-form-group">
                    <label><FaKey /> Senha de Acesso</label>
                    <input 
                      type="password" 
                      name="senha" 
                      value={formData.senha || ''} 
                      onChange={handleInputChange} 
                      placeholder="Mínimo 6 caracteres" 
                      required 
                    />
                  </div>
                  <div className="modal-form-group">
                    <label><FaBriefcase /> Tipo de Acesso</label>
                    <select name="tipoFuncionario" value={formData.tipoFuncionario || 2} onChange={handleInputChange}>
                      <option value={2}>Funcionário Normal</option>
                      <option value={1}>Administrador</option>
                    </select>
                  </div>
                  <div className="modal-form-group">
                    <label>Cargo / Nível de Acesso</label>
                    <select name="cargo" value={formData.cargo || 1} onChange={handleInputChange}>
                      <option value={1}>Técnico / Mecânico</option>
                      <option value={2}>Supervisor</option>
                      <option value={3}>Gerente</option>
                    </select>
                  </div>
                </>
              )}

              {/* FORMULÁRIO: EDITAR CLIENTE */}
              {modalType === 'editCliente' && (
                <>
                  <div className="modal-form-group">
                    <label><FaUser /> Nome</label>
                    <input 
                      type="text" 
                      name="nome" 
                      value={formData.nome || ''} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <div className="modal-form-group">
                    <label><FaEnvelope /> Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email || ''} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <div className="modal-form-group">
                    <label><FaIdCard /> CPF</label>
                    <input 
                      type="text" 
                      name="cpf" 
                      value={formData.cpf || ''} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <div className="modal-form-group">
                    <label><FaPhoneAlt /> Telefone</label>
                    <input 
                      type="text" 
                      name="telefone" 
                      value={formData.telefone || ''} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <div className="modal-form-group">
                    <label><FaCar /> Placa do Veículo</label>
                    <input 
                      type="text" 
                      name="placaVeiculo" 
                      value={formData.placaVeiculo || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </>
              )}

              {/* FORMULÁRIO: EDITAR FUNCIONÁRIO */}
              {modalType === 'editFuncionario' && (
                <>
                  <div className="modal-form-group">
                    <label><FaUser /> Nome</label>
                    <input 
                      type="text" 
                      name="nomeFuncionario" 
                      value={formData.nomeFuncionario || ''} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <div className="modal-form-group">
                    <label><FaEnvelope /> Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email || ''} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <div className="modal-form-group">
                    <label><FaKey /> Redefinir Senha (opcional)</label>
                    <input 
                      type="password" 
                      name="senha" 
                      value={formData.senha || ''} 
                      onChange={handleInputChange} 
                      placeholder="Deixe vazio para manter a atual" 
                    />
                  </div>
                  <div className="modal-form-group">
                    <label><FaBriefcase /> Tipo de Acesso</label>
                    <select name="tipoFuncionario" value={formData.tipoFuncionario} onChange={handleInputChange}>
                      <option value={2}>Funcionário Normal</option>
                      <option value={1}>Administrador</option>
                    </select>
                  </div>
                  <div className="modal-form-group">
                    <label>Cargo / Nível</label>
                    <select name="cargo" value={formData.cargo} onChange={handleInputChange}>
                      <option value={1}>Técnico / Mecânico</option>
                      <option value={2}>Supervisor</option>
                      <option value={3}>Gerente</option>
                    </select>
                  </div>
                </>
              )}

              {/* FORMULÁRIO: EDITAR REVISÃO */}
              {modalType === 'editRevisao' && (
                <>
                  <div className="modal-form-group">
                    <label>Plano de Revisão</label>
                    <select name="tipoRevisao" value={formData.tipoRevisao} onChange={handleInputChange}>
                      <option value={1}>Bronze (Básico)</option>
                      <option value={2}>Silver (Premium)</option>
                      <option value={3}>Gold (Super Premium)</option>
                    </select>
                  </div>
                  <div className="modal-form-group">
                    <label>Status do Serviço</label>
                    <select name="statusRevisao" value={formData.statusRevisao} onChange={handleInputChange}>
                      <option value="Pendente">Pendente</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Concluído">Concluído</option>
                    </select>
                  </div>
                  <div className="modal-form-group">
                    <label><FaCalendarAlt /> Data e Hora Agendada</label>
                    <input 
                      type="datetime-local" 
                      name="datAgendamento" 
                      value={formData.datAgendamento || ''} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <div className="modal-form-group">
                    <label>Associar a Cliente</label>
                    <select name="idCliente" value={formData.idCliente} onChange={handleInputChange}>
                      {clientes.map(c => (
                        <option key={c.id} value={c.id}>{c.nome} (Placa: {c.placaVeiculo || 'N/A'})</option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-form-group">
                    <label>Atribuir a Funcionário</label>
                    <select name="idFuncionario" value={formData.idFuncionario} onChange={handleInputChange}>
                      <option value={0}>Sem Atribuição (Pendente)</option>
                      {funcionarios.map(f => (
                        <option key={f.idFuncionario} value={f.idFuncionario}>{f.nomeFuncionario} ({f.tipoFuncionario === 1 ? 'Admin' : 'Operador'})</option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-form-group">
                    <label>Observação do Cliente (opcional)</label>
                    <textarea
                      name="observacaoCliente"
                      value={formData.observacaoCliente || ''}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Sintomas ou observações informadas pelo cliente..."
                      className="modal-textarea"
                    />
                  </div>
                  <div className="modal-form-group">
                    <label>Feedback do Mecânico (opcional)</label>
                    <textarea
                      name="feedbackMecanico"
                      value={formData.feedbackMecanico || ''}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Diagnóstico ou serviço realizado..."
                      className="modal-textarea"
                    />
                  </div>
                </>
              )}

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-submit">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
