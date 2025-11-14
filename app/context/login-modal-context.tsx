import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import LoginModal from '~/components/website/LoginModal';

type LoginModalContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const LoginModalContext = createContext<LoginModalContextValue | undefined>(undefined);

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return (
    <LoginModalContext.Provider value={value}>
      {children}
      <LoginModal />
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const context = useContext(LoginModalContext);

  if (!context) {
    throw new Error('useLoginModal must be used within a LoginModalProvider');
  }

  return context;
}
