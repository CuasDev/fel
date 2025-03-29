import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar si hay un token en localStorage
    const token = localStorage.getItem('token');
    if (token) {
      loadUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (token) => {
    try {
      // Configurar el token en los headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Obtener el perfil del usuario
      const res = await axios.get('/users/profile');
      
      if (res.data.success) {
        setUser(res.data.data);
      } else {
        // Si hay un error, limpiar el token
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setError('Error al cargar el perfil de usuario');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post('/users/login', { email, password });
      
      if (res.data.success) {
        const { token } = res.data.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(res.data.data);
        return true;
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setError(
        error.response?.data?.message ||
        'Error al iniciar sesión. Verifique sus credenciales.'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post('/users/register', userData);
      
      if (res.data.success) {
        const { token } = res.data.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(res.data.data);
        return true;
      }
    } catch (error) {
      console.error('Error de registro:', error);
      setError(
        error.response?.data?.message ||
        'Error al registrar usuario. Inténtelo de nuevo.'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.put('/users/profile', userData);
      
      if (res.data.success) {
        setUser(res.data.data);
        return true;
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError(
        error.response?.data?.message ||
        'Error al actualizar el perfil. Inténtelo de nuevo.'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};