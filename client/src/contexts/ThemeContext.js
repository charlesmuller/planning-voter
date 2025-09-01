import React, { createContext, useContext, useEffect, useState } from 'react';

// Criação do contexto para o tema
const ThemeContext = createContext();

// Hook personalizado para usar o contexto do tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

// Provider do tema que envolverá a aplicação
export const ThemeProvider = ({ children }) => {
  // Estado para controlar se está no modo escuro
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Tenta recuperar a preferência salva no localStorage
    const savedTheme = localStorage.getItem('planning-voter-theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    
    // Se não há preferência salva, verifica a preferência do sistema
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Função para alternar entre os temas
  const toggleTheme = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      // Salva a preferência no localStorage
      localStorage.setItem('planning-voter-theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  // Efeito para aplicar a classe CSS do tema no body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  // Escuta mudanças na preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Só aplica a preferência do sistema se não há preferência salva pelo usuário
      const savedTheme = localStorage.getItem('planning-voter-theme');
      if (!savedTheme) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? 'dark' : 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
