/**
 * @file EmployeeDashboard.jsx
 * @description Dashboard Kanban exclusivo para usuários com role "Funcionario".
 *
 * Organiza as revisões em três colunas:
 * - Pendentes: revisões aguardando atribuição (GET /danke/revisao/pendentes)
 * - Em Andamento: revisões associadas ao funcionário autenticado em progresso
 * - Concluídas: revisões finalizadas pelo funcionário
 *
 * Transições de status via PATCH /danke/revisao/{id}.
 * Na primeira interação (Iniciar), o backend auto-atribui o IdFuncionario.
 *
 * Acessível apenas por rotas protegidas com `allowedRoles={["Funcionario"]}`.
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import './EmployeeDashboard.css';
import { FaPlay, FaCheck, FaCar, FaUser, FaPhoneAlt, FaCalendarAlt } from 'react-icons/fa';

/**
 * Componente do dashboard Kanban do funcionário.
 * Exibe revisões em três colunas e permite transições de status.
 *
 * @returns {JSX.Element}
 */
function EmployeeDashboard() {  
  const [pendentes, setPendentes] = useState([]);
  const [minhasRevisoes, setMinhasRevisoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [feedbacks, setFeedbacks] = useState({});

  useEffect(() => {
    carregarDados();
  }, []);

  /**
   * Carrega as revisões pendentes e as revisões associadas ao funcionário autenticado.
   * Executa duas requisições em paralelo; exibe mensagem de erro se alguma falhar.
   *
   * @async
   * @returns {Promise<void>}
   */
  const carregarDados = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      
      const [responsePendentes, responseMinhas] = await Promise.all([
        api.get('/danke/revisao/pendentes'),
        api.get('/danke/revisao/funcionario'),
      ]);

      setPendentes(responsePendentes.data);
      setMinhasRevisoes(responseMinhas.data);
    } catch (error) {
      console.error('Erro ao carregar dados do Kanban:', error);
      const apiMessage = error.response?.data?.message;
      setErrorMsg(apiMessage || 'Não foi possível carregar os dados. Verifique a conexão com a API.');
    } finally {
      setLoading(false);
    }
  };

  const getApiErrorMessage = (error, fallback) =>
    error.response?.data?.message || fallback;

  /**
   * Inicia uma revisão pendente: envia PATCH com status "Em Andamento".
   * O backend auto-atribui o IdFuncionario se ainda não houver um.
   * Recarrega os dados após sucesso.
   *
   * @async
   * @param {number} idRevisao - ID da revisão a iniciar.
   * @returns {Promise<void>}
   */
  const handleStartRevision = async (idRevisao) => {
    try {
      setErrorMsg('');
      await api.patch(`/danke/revisao/${idRevisao}`, {
        statusRevisao: 'Em Andamento'
      });
      await carregarDados();
    } catch (error) {
      console.error('Erro ao iniciar revisão:', error);
      setErrorMsg(getApiErrorMessage(error, 'Falha ao iniciar a revisão. Tente novamente.'));
    }
  };

  /**
   * Conclui uma revisão em andamento: envia PATCH com status "Concluído".
   * O backend registra DatFinalizacao = DateTime.UtcNow.
   * Recarrega os dados após sucesso.
   *
   * @async
   * @param {number} idRevisao - ID da revisão a concluir.
   * @returns {Promise<void>}
   */
  const handleCompleteRevision = async (idRevisao) => {
    try {
      setErrorMsg('');
      const feedback = (feedbacks[idRevisao] || '').trim();
      await api.patch(`/danke/revisao/${idRevisao}`, {
        statusRevisao: 'Concluído',
        feedbackMecanico: feedback || null
      });
      await carregarDados();
    } catch (error) {
      console.error('Erro ao concluir revisão:', error);
      setErrorMsg(getApiErrorMessage(error, 'Falha ao concluir a revisão. Tente novamente.'));
    }
  };

  // Separa as minhas revisões em colunas do Kanban
  const emAndamento = minhasRevisoes.filter(r => r.statusRevisao === 'Em Andamento');
  const concluidas = minhasRevisoes.filter(r => r.statusRevisao === 'Concluído');

  /**
   * Retorna o rótulo e classe CSS do badge para o tipo de revisão.
   *
   * @param {number} tipo - 1 = Bronze, 2 = Silver, 3 = Gold.
   * @returns {{ name: string, class: string }}
   */
  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 1: return { name: 'Bronze', class: 'badge-bronze' };
      case 2: return { name: 'Silver', class: 'badge-silver' };
      case 3: return { name: 'Gold', class: 'badge-gold' };
      default: return { name: 'N/A', class: '' };
    }
  };

  /**
   * Formata uma string de data ISO para o padrão brasileiro (dd/mm/aaaa HH:MM).
   *
   * @param {string} dataStr - String de data no formato ISO 8601.
   * @returns {string} Data formatada ou "-" se o valor for nulo/vazio.
   */
  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="employee-dashboard-container">
      <Navbar variant="dashboard" title="Painel Oficina (Kanban)" roleLabel="Funcionário" iconTheme="employee" />

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
                        {rev.observacaoCliente && (
                          <div className="card-notes client-notes">
                            <strong>Obs. do Cliente:</strong> "{rev.observacaoCliente}"
                          </div>
                        )}
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
                        {rev.observacaoCliente && (
                          <div className="card-notes client-notes">
                            <strong>Obs. do Cliente:</strong> "{rev.observacaoCliente}"
                          </div>
                        )}
                        <div className="feedback-input-group">
                          <label htmlFor={`feedback-${rev.idRevisao}`}>Feedback / Diagnóstico (opcional):</label>
                          <textarea
                            id={`feedback-${rev.idRevisao}`}
                            placeholder="Descreva o serviço ou diagnóstico..."
                            value={feedbacks[rev.idRevisao] || ''}
                            onChange={(e) => setFeedbacks({ ...feedbacks, [rev.idRevisao]: e.target.value })}
                            className="feedback-textarea"
                          />
                        </div>
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
                        {rev.observacaoCliente && (
                          <div className="card-notes client-notes">
                            <strong>Obs. do Cliente:</strong> "{rev.observacaoCliente}"
                          </div>
                        )}
                        {rev.feedbackMecanico && (
                          <div className="card-notes mechanic-feedback-note">
                            <strong>Feedback do Mecânico:</strong> "{rev.feedbackMecanico}"
                          </div>
                        )}
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
