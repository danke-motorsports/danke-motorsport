/**
 * @file AuthContext.jsx
 * @description Context de autenticação global da aplicação Danke Motorsport.
 *
 * Fornece:
 * - Estado do usuário autenticado (`user`, `signed`, `loading`)
 * - Funções `login` e `logout`
 * - Persistência do token JWT e dados do usuário no `localStorage`
 *
 * Envolva a aplicação com `<AuthProvider>` em `main.jsx` para disponibilizar o contexto.
 * Use o hook `useAuth()` nos componentes para acessar os valores.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

/**
 * Provedor de autenticação. Deve envolver toda a árvore de componentes que
 * precisam de acesso ao contexto de autenticação.
 *
 * Na inicialização, reidrata o estado a partir do `localStorage` para manter
 * a sessão do usuário mesmo após recarregar a página.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reidrata sessão persistida ao iniciar a aplicação
    const storagedUser = localStorage.getItem('@DankeMotorsport:user');
    const storagedToken = localStorage.getItem('@DankeMotorsport:token');

    if (storagedUser && storagedToken) {
      setUser(JSON.parse(storagedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Autentica o usuário via POST /danke/auth/login.
   * Persiste o token JWT e os dados do usuário no `localStorage`.
   *
   * @param {string} email - E-mail do usuário.
   * @param {string} senha - Senha em plaintext (enviada via HTTPS).
   * @returns {Promise<{ id: number, nome: string, email: string, role: string }>} Dados do usuário autenticado.
   * @throws {AxiosError} Se as credenciais forem inválidas (401) ou houver erro de rede.
   */
  const login = async (email, senha) => {
    const response = await api.post('/danke/auth/login', { email, senha });
    const { token, user: loggedUser } = response.data;

    localStorage.setItem('@DankeMotorsport:token', token);
    localStorage.setItem('@DankeMotorsport:user', JSON.stringify(loggedUser));

    setUser(loggedUser);
    return loggedUser;
  };

  /**
   * Encerra a sessão do usuário: remove token e dados do `localStorage`
   * e reseta o estado local para `null`.
   *
   * @returns {void}
   */
  const logout = () => {
    localStorage.removeItem('@DankeMotorsport:token');
    localStorage.removeItem('@DankeMotorsport:user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('@DankeMotorsport:user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de autenticação.
 * Deve ser usado dentro de um componente filho de `<AuthProvider>`.
 *
 * @returns {{ signed: boolean, user: object|null, loading: boolean, login: Function, logout: Function }}
 * @throws {Error} Se usado fora do `AuthProvider`.
 *
 * @example
 * const { user, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
