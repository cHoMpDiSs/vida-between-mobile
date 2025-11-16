import React, { createContext, useContext } from 'react';

interface NavigationContextType {
  navigateToChat: (groupId: string, groupName: string) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

export const NavigationProvider = NavigationContext.Provider;

