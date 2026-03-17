import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('civicfix_token');
    const storedUser = localStorage.getItem('civicfix_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Always refresh user data from DB to get latest role
      axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` }
      }).then(({ data }) => {
        setUser(data);
        localStorage.setItem('civicfix_user', JSON.stringify(data));
      }).catch(() => {
        // Token invalid — log out
        setToken(null);
        setUser(null);
        localStorage.removeItem('civicfix_token');
        localStorage.removeItem('civicfix_user');
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('civicfix_token', jwtToken);
    localStorage.setItem('civicfix_user', JSON.stringify(userData));
    return true;
  };

  const updateUser = (updatedUserData) => {
    const newUser = { ...user, ...updatedUserData };
    setUser(newUser);
    localStorage.setItem('civicfix_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('civicfix_token');
    localStorage.removeItem('civicfix_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, updateUser, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
