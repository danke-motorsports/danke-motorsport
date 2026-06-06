import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './EmployeeDashboard.css';
import { FaSignOutAlt, FaWrench, FaPlay, FaCheck, FaCar, FaUser, FaPhoneAlt, FaCalendarAlt } from 'react-icons/fa';

function EmployeeDashboard() {
  const { user, logout } = useAuth();
  
  const [pendentes, setPendentes] = useState([]);
  const [minhasRevisoes, setMinhasRevisoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      
      // 1. Carrega as revisões pendentes (sem funcionário associado)
      const responsePendentes = await api.get('/danke/revisao/pendentes');
      setPendentes(responsePendentes.data);

      // 2. Carrega as revisões associadas ao funcionário logado
      const responseMinhas = await api.get('/danke/revisao/funcionario');
      setMinhasRevisoes(responseMinhas.data);
    } catch (error) {
      console.error('Erro ao carregar dados do Kanban:', error);
      setErrorMsg('Não foi possível carregar os dados. Verifique a conexão com a API.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRevision = async (idRevisao) => {
    try {
      setErrorMsg('');
      // Dispara PATCH para mover para "Em Andamento" e atrelar ao funcionário
      const response = await api.patch(`/danke/revisao/${idRevisao}`, {
        statusRevisao: 'Em Andamento'
      });

      if (response.status === 200) {
        // Recarrega os dados após o sucesso
        carregarDados();
      }
    } catch (error) {
      console.error('Erro ao iniciar revisão:', error);
      setErrorMsg('Falha ao iniciar a revisão. Tente novamente.');
    }
  };

  const handleCompleteRevision = async (idRevisao) => {
    try {
      setErrorMsg('');
      // Dispara PATCH para mover para "Concluído"
      const response = await api.patch(`/danke/revisao/${idRevisao}`, {
        statusRevisao: 'Concluído'
      });

      if (response.status === 200) {
        carregarDados();
      }
    } catch (error) {
      console.error('Erro ao concluir revisão:', error);
      setErrorMsg('Falha ao concluir a revisão. Tente novamente.');
    }
  };

  // Separa as minhas revisões em colunas do Kanban
  const emAndamento = minhasRevisoes.filter(r => r.statusRevisao === 'Em Andamento');
  const concluidas = minhasRevisoes.filter(r => r.statusRevisao === 'Concluído');

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 1: return { name: 'Bronze', class: 'badge-bronze' };
      case 2: return { name: 'Silver', class: 'badge-silver' };
      case 3: return { name: 'Gold', class: 'badge-gold' };
      default: return { name: 'N/A', class: '' };
    }
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="employee-dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container">
          <FaWrench className="header-icon" />
          <h1>Painel Oficina (Kanban)</h1>
        </div>
        <div className="user-profile">
          <span>Operador: <strong>{user?.nome}</strong> (Funcionário)</span>
          <button className="logout-button" onClick={logout} title="Sair da Conta">
            <FaSignOutAlt /> Sair
          </button>
        </div>
      </header>

      {errorMsg && (
        <div className="kanban-error-alert">
          {errorMsg}
          <button onClick={carregarDados}>Tentar novamente</button>
        </div>
      )}

      {loading ? (
        <div className="kanban-loading">Carregando quadro Kanban...</div>
      ) : (
        <main className="kanban-board">
          {/* COLUNA 1: PENDENTES */}
          <div className="kanban-column column-pendentes">
            <div className="column-header">
              <h2>Pendentes</h2>
              <span className="column-count">{pendentes.length}</span>
            </div>
            <div className="column-cards">
              {pendentes.length === 0 ? (
                <div className="empty-column-placeholder">Nenhuma revisão pendente</div>
              ) : (
                pendentes.map((rev) => {
                  const tier = getTipoLabel(rev.tipoRevisao);
                  return (
                    <div className="kanban-card" key={rev.idRevisao}>
                      <div className="card-header">
                        <span className="card-id">#{rev.idRevisao}</span>
                        <span className={`tier-badge ${tier.class}`}>{tier.name}</span>
                      </div>
                      
                      <div className="card-body">
                        <p className="card-detail">
                          <FaUser className="card-icon" /> 
                          <strong>Cliente:</strong> {rev.cliente?.nome || `ID ${rev.idCliente}`}
                        </p>
                        <p className="card-detail">
                          <FaCar className="card-icon" /> 
                          <strong>Placa:</strong> {rev.cliente?.placaVeiculo || 'N/D'}
                        </p>
                        {rev.cliente?.telefone && (
                          <p className="card-detail">
                            <FaPhoneAlt className="card-icon" /> 
                            <strong>Telefone:</strong> {rev.cliente.telefone}
                          </p>
                        )}
                        <p className="card-detail data-agendada">
                          <FaCalendarAlt className="card-icon" /> 
                          <strong>Agendamento:</strong> {formatarData(rev.datAgendamento)}
                        </p>
                      </div>

                      <div className="card-actions">
                        <button 
                          className="action-btn btn-start" 
                          onClick={() => handleStartRevision(rev.idRevisao)}
                        >
                          <FaPlay /> Iniciar Revisão
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUNA 2: EM ANDAMENTO */}
          <div className="kanban-column column-andamento">
            <div className="column-header">
              <h2>Em Andamento</h2>
              <span className="column-count">{emAndamento.length}</span>
            </div>
            <div className="column-cards">
              {emAndamento.length === 0 ? (
                <div className="empty-column-placeholder">Nenhum serviço em andamento</div>
              ) : (
                emAndamento.map((rev) => {
                  const tier = getTipoLabel(rev.tipoRevisao);
                  return (
                    <div className="kanban-card active-card" key={rev.idRevisao}>
                      <div className="card-header">
                        <span className="card-id">#{rev.idRevisao}</span>
                        <span className={`tier-badge ${tier.class}`}>{tier.name}</span>
                      </div>
                      
                      <div className="card-body">
                        <p className="card-detail">
                          <FaUser className="card-icon" /> 
                          <strong>Cliente:</strong> {rev.cliente?.nome || `ID ${rev.idCliente}`}
                        </p>
                        <p className="card-detail">
                          <FaCar className="card-icon" /> 
                          <strong>Placa:</strong> {rev.cliente?.placaVeiculo || 'N/D'}
                        </p>
                        {rev.cliente?.telefone && (
                          <p className="card-detail">
                            <FaPhoneAlt className="card-icon" /> 
                            <strong>Telefone:</strong> {rev.cliente.telefone}
                          </p>
                        )}
                        <p className="card-detail data-agendada">
                          <FaCalendarAlt className="card-icon" /> 
                          <strong>Agendamento:</strong> {formatarData(rev.datAgendamento)}
                        </p>
                      </div>

                      <div className="card-actions">
                        <button 
                          className="action-btn btn-complete" 
                          onClick={() => handleCompleteRevision(rev.idRevisao)}
                        >
                          <FaCheck /> Concluir
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUNA 3: CONCLUÍDOS */}
          <div className="kanban-column column-concluidos">
            <div className="column-header">
              <h2>Concluídos</h2>
              <span className="column-count">{concluidas.length}</span>
            </div>
            <div className="column-cards">
              {concluidas.length === 0 ? (
                <div className="empty-column-placeholder">Nenhum serviço concluído</div>
              ) : (
                concluidas.map((rev) => {
                  const tier = getTipoLabel(rev.tipoRevisao);
                  return (
                    <div className="kanban-card completed-card" key={rev.idRevisao}>
                      <div className="card-header">
                        <span className="card-id">#{rev.idRevisao}</span>
                        <span className={`tier-badge ${tier.class}`}>{tier.name}</span>
                      </div>
                      
                      <div className="card-body">
                        <p className="card-detail">
                          <FaUser className="card-icon" /> 
                          <strong>Cliente:</strong> {rev.cliente?.nome || `ID ${rev.idCliente}`}
                        </p>
                        <p className="card-detail">
                          <FaCar className="card-icon" /> 
                          <strong>Placa:</strong> {rev.cliente?.placaVeiculo || 'N/D'}
                        </p>
                        <p className="card-detail concluded-date">
                          <strong>Concluído em:</strong> {formatarData(rev.datFinalizacao)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default EmployeeDashboard;
