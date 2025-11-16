import React, { createContext, useContext, ReactNode } from 'react';

interface AppInitContextType {
  isInitialized: boolean;
  isSeeded: boolean;
}

const AppInitContext = createContext<AppInitContextType | undefined>(undefined);

export const useAppInit = () => {
  const context = useContext(AppInitContext);
  if (context === undefined) {
    throw new Error('useAppInit must be used within an AppInitProvider');
  }
  return context;
};

interface AppInitProviderProps {
  children: ReactNode;
  isInitialized: boolean;
  isSeeded: boolean;
}

export const AppInitProvider: React.FC<AppInitProviderProps> = ({
  children,
  isInitialized,
  isSeeded,
}) => {
  return (
    <AppInitContext.Provider value={{ isInitialized, isSeeded }}>
      {children}
    </AppInitContext.Provider>
  );
};
