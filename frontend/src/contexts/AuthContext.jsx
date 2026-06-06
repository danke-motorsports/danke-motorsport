import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carrega dados persistidos ao iniciar a aplicação
    const storagedUser = localStorage.getItem('@DankeMotorsport:user');
    const storagedToken = localStorage.getItem('@DankeMotorsport:token');

    if (storagedUser && storagedToken) {
      setUser(JSON.parse(storagedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    const response = await api.post('/danke/auth/login', { email, senha });
    const { token, user: loggedUser } = response.data;

    // Salva no LocalStorage
    localStorage.setItem('@DankeMotorsport:token', token);
    localStorage.setItem('@DankeMotorsport:user', JSON.stringify(loggedUser));

    setUser(loggedUser);
    return loggedUser;
  };

  const logout = () => {
    localStorage.removeItem('@DankeMotorsport:token');
    localStorage.removeItem('@DankeMotorsport:user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
