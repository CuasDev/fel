import React, { createContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Definir los tipos de temas disponibles
export const themeOptions = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Crear el contexto
export const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  // Estado para almacenar el modo de tema actual
  const [mode, setMode] = useState(() => {
    // Intentar obtener el tema guardado en localStorage
    const savedTheme = localStorage.getItem('themeMode');
    return savedTheme || themeOptions.SYSTEM;
  });

  // Estado para el tema del sistema (claro u oscuro)
  const [systemTheme, setSystemTheme] = useState(() => {
    // Verificar si el sistema prefiere el tema oscuro
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? themeOptions.DARK
      : themeOptions.LIGHT;
  });

  // Efecto para detectar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemTheme(e.matches ? themeOptions.DARK : themeOptions.LIGHT);
    };
    
    // Agregar listener para cambios en la preferencia del sistema
    mediaQuery.addEventListener('change', handleChange);
    
    // Limpiar listener al desmontar
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Función para cambiar el tema
  const setThemeMode = (newMode) => {
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // Determinar el tema actual basado en el modo seleccionado
  const currentTheme = mode === themeOptions.SYSTEM ? systemTheme : mode;

  // Crear el tema de Material UI
  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode: currentTheme,
        primary: {
          main: '#1976d2',
        },
        secondary: {
          main: '#dc004e',
        },
        background: {
          default: currentTheme === themeOptions.DARK ? '#121212' : '#f5f5f5',
          paper: currentTheme === themeOptions.DARK ? '#1e1e1e' : '#ffffff',
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: 14,
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
      },
    });
  }, [currentTheme]);

  // Valores a proporcionar en el contexto
  const contextValue = {
    mode,
    setThemeMode,
    themeOptions,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar el contexto del tema
export const useThemeContext = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext debe ser usado dentro de un ThemeContextProvider');
  }
  return context;
};