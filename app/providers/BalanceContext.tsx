import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '~/types';

interface BalanceState {
  weiBalance: string;
  freeWeiBalance: string;
  tokenBalance: number;
}

interface BalanceContextType {
  balance: BalanceState;
  updateBalance: (updates: Partial<BalanceState>) => void;
  setInitialBalance: (user: User) => void;
}

const BalanceContext = createContext<BalanceContextType | null>(null);

interface BalanceProviderProps {
  children: ReactNode;
  initialUser?: User;
}

export const BalanceProvider: React.FC<BalanceProviderProps> = ({ children, initialUser }) => {
  const [balance, setBalance] = useState<BalanceState>({
    weiBalance: initialUser?.weiBalance || '0',
    freeWeiBalance: initialUser?.freeWeiBalance || '0',
    tokenBalance: initialUser?.tokenBalance || 0,
  });

  const updateBalance = useCallback((updates: Partial<BalanceState>) => {
    setBalance(prev => ({ ...prev, ...updates }));
  }, []);

  const setInitialBalance = useCallback((user: User) => {
    setBalance({
      weiBalance: user.weiBalance || '0',
      freeWeiBalance: user.freeWeiBalance || '0',
      tokenBalance: user.tokenBalance || 0,
    });
  }, []);

  const contextValue: BalanceContextType = {
    balance,
    updateBalance,
    setInitialBalance,
  };

  return (
    <BalanceContext.Provider value={contextValue}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = (): BalanceContextType => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};