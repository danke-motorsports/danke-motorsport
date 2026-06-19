/**
 * @file ClientDashboard.jsx
 * @description Dashboard exclusivo para usuários com role "Cliente".
 *
 * Funcionalidades:
 * - Solicitar nova revisão escolhendo plano (Bronze / Silver / Gold) e data
 * - Visualizar histórico de todas as revisões do cliente autenticado
 * - Logout
 *
 * Dados consumidos via GET /danke/revisao/cliente (autenticado por JWT).
 * Agendamento via POST /danke/revisao (IdCliente extraído do JWT pelo backend).
 *
 * Acessível apenas por rotas protegidas com `allowedRoles={["Cliente"]}`.
 */

import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import DashboardUserMenu from '../components/DashboardUserMenu';
import './ClientDashboard.css';
import { FaPlus, FaClock, FaHistory, FaWrench } from 'react-icons/fa';

/**
 * Componente do dashboard do cliente.
 * Exibe formulário de agendamento e histórico de revisões.
 *
 * @returns {JSX.Element}
 */
function ClientDashboard() {
  const { user } = useAuth();
  const [revisoes, setRevisoes] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  const [tipoRevisao, setTipoRevisao] = useState(1); // 1 = Bronze, 2 = Silver, 3 = Gold
  const [datAgendamento, setDatAgendamento] = useState('');
  const [observacaoCliente, setObservacaoCliente] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    carregarRevisoes();
  }, []);

  /**
   * Busca as revisões do cliente autenticado via GET /danke/revisao/cliente.
   * Atualiza o estado `revisoes` com os dados retornados.
   *
   * @async
   * @returns {Promise<void>}
   */
  const carregarRevisoes = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get('/danke/revisao/cliente');
      setRevisoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar revisões:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!datAgendamento) {
      setMessage({ text: 'Por favor, selecione uma data para o agendamento.', type: 'error' });
      return;
    }

    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      await api.post('/danke/revisao', {
        tipoRevisao: parseInt(tipoRevisao),
        datAgendamento: new Date(datAgendamento).toISOString(),
        observacaoCliente: observacaoCliente || null
      });

      setMessage({ text: 'Revisão solicitada com sucesso!', type: 'success' });
      setDatAgendamento('');
      setObservacaoCliente('');
      carregarRevisoes();
    } catch (error) {
      console.error('Erro ao solicitar revisão:', error);
      setMessage({ text: 'Erro ao enviar a solicitação. Tente novamente.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Retorna o rótulo e a classe CSS do badge para o tipo de revisão.
   *
   * @param {number} tipo - Tipo da revisão: 1 = Bronze, 2 = Silver, 3 = Gold.
   * @returns {{ name: string, class: string }}
   */
  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 1: return { name: 'Bronze (Básico)', class: 'badge-bronze' };
      case 2: return { name: 'Silver (Premium)', class: 'badge-silver' };
      case 3: return { name: 'Gold (Super Premium)', class: 'badge-gold' };
      default: return { name: 'Desconhecido', class: '' };
    }
  };

  /**
   * Retorna a classe CSS do badge de status da revisão.
   *
   * @param {string} status - Status da revisão: "Pendente", "Em Andamento" ou "Concluído".
   * @returns {string} Nome da classe CSS correspondente.
   */
  const getStatusLabel = (status) => {
    switch (status) {
      case 'Pendente': return 'status-pendente';
      case 'Em Andamento': return 'status-andamento';
      case 'Concluído': return 'status-concluido';
      default: return '';
    }
  };

  /**
   * Formata uma string de data ISO para o padrão brasileiro (dd/mm/aaaa às HH:MM).
   *
   * @param {string} dataStr - String de data no formato ISO 8601.
   * @returns {string} Data formatada ou "-" se o valor for nulo/vazio.
   */
  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="client-dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container">
          <FaWrench className="header-icon" />
          <h1>Danke Motorsport</h1>
        </div>
        <DashboardUserMenu roleLabel="Cliente" />
      </header>

      <main className="dashboard-main">
        {/* Formulário de solicitação de revisão */}
        <section className="form-section glass-card">
          <h2>
            <FaPlus className="section-icon" /> Solicitar Nova Revisão
          </h2>
          <form onSubmit={handleSubmit} className="revision-form">
            {message.text && (
              <div className={`form-message ${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="form-group">
              <label>Escolha o Plano de Qualidade:</label>
              <div className="tier-cards">
                <label className={`tier-card ${tipoRevisao === 1 ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="tipoRevisao" 
                    value="1" 
                    checked={tipoRevisao === 1}
                    onChange={() => setTipoRevisao(1)} 
                  />
                  <div className="tier-info">
                    <span className="tier-title bronze">BRONZE</span>
                    <span className="tier-desc">Revisão básica de segurança e fluidos essenciais</span>
                  </div>
                </label>

                <label className={`tier-card ${tipoRevisao === 2 ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="tipoRevisao" 
                    value="2" 
                    checked={tipoRevisao === 2}
                    onChange={() => setTipoRevisao(2)} 
                  />
                  <div className="tier-info">
                    <span className="tier-title silver">SILVER</span>
                    <span className="tier-desc">Revisão completa, suspensão, freios e motor</span>
                  </div>
                </label>

                <label className={`tier-card ${tipoRevisao === 3 ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="tipoRevisao" 
                    value="3" 
                    checked={tipoRevisao === 3}
                    onChange={() => setTipoRevisao(3)} 
                  />
                  <div className="tier-info">
                    <span className="tier-title gold">GOLD</span>
                    <span className="tier-desc">Diagnóstico eletrônico avançado de performance e ajustes finos</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="datAgendamento">Data e Hora do Agendamento:</label>
              <input 
                type="datetime-local" 
                id="datAgendamento"
                value={datAgendamento}
                onChange={(e) => setDatAgendamento(e.target.value)}
                required
                className="date-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="observacaoCliente">Observações ou Sintomas (Opcional):</label>
              <textarea 
                id="observacaoCliente"
                placeholder="Ex: Barulho na suspensão, luz da injeção acesa..."
                value={observacaoCliente}
                onChange={(e) => setObservacaoCliente(e.target.value)}
                className="observation-textarea"
                rows="3"
              />
            </div>

            <button type="submit" className="submit-button" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Confirmar Agendamento'}
            </button>
          </form>
        </section>

        {/* Histórico de Solicitações */}
        <section className="history-section glass-card">
          <h2>
            <FaHistory className="section-icon" /> Minhas Solicitações
          </h2>
          {loadingHistory ? (
            <div className="dashboard-loading">Carregando histórico...</div>
          ) : revisoes.length === 0 ? (
            <div className="empty-state">
              <FaClock className="empty-icon" />
              <p>Você ainda não possui solicitações de revisão cadastradas.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Plano</th>
                    <th>Agendado Para</th>
                    <th>Status</th>
                    <th>Finalizado Em</th>
                  </tr>
                </thead>
                <tbody>
                  {revisoes.map((rev) => {
                    const tier = getTipoLabel(rev.tipoRevisao);
                    return (
                      <Fragment key={rev.idRevisao}>
                        <tr>
                          <td className="col-id">#{rev.idRevisao}</td>
                          <td>
                            <span className={`tier-badge ${tier.class}`}>{tier.name}</span>
                          </td>
                          <td>{formatarData(rev.datAgendamento)}</td>
                          <td>
                            <span className={`status-badge ${getStatusLabel(rev.statusRevisao)}`}>
                              {rev.statusRevisao}
                            </span>
                          </td>
                          <td>{rev.statusRevisao === 'Concluído' ? formatarData(rev.datFinalizacao) : '-'}</td>
                        </tr>
                        {(rev.observacaoCliente || rev.feedbackMecanico) && (
                          <tr className="detail-row">
                            <td colSpan="5">
                              <div className="detail-container">
                                {rev.observacaoCliente && (
                                  <div className="detail-block">
                                    <strong>Minha Observação:</strong> "{rev.observacaoCliente}"
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
          )}
        </section>
      </main>
    </div>
  );
}

export default ClientDashboard;
