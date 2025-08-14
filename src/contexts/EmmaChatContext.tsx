import React, { createContext, useContext, useState, useCallback } from 'react';

interface EmmaChatContextType {
  isEmmaOpen: boolean;
  openEmmaChat: () => void;
  closeEmmaChat: () => void;
}

const EmmaChatContext = createContext<EmmaChatContextType | undefined>(undefined);

export const useEmmaChat = () => {
  const context = useContext(EmmaChatContext);
  if (!context) {
    throw new Error('useEmmaChat must be used within an EmmaChatProvider');
  }
  return context;
};

interface EmmaChatProviderProps {
  children: React.ReactNode;
}

export const EmmaChatProvider: React.FC<EmmaChatProviderProps> = ({ children }) => {
  const [isEmmaOpen, setIsEmmaOpen] = useState(false);

  const openEmmaChat = useCallback(() => {
    setIsEmmaOpen(true);
  }, []);

  const closeEmmaChat = useCallback(() => {
    setIsEmmaOpen(false);
  }, []);

  return (
    <EmmaChatContext.Provider value={{ isEmmaOpen, openEmmaChat, closeEmmaChat }}>
      {children}
    </EmmaChatContext.Provider>
  );
};