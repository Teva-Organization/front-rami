import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type ToastVariant = 'default' | 'destructive';

export type ToastMessage = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  showToast: (message: ToastMessage) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_DURATION = 3000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (message: ToastMessage) => {
      clearTimer();
      setToast(message);
    },
    [clearTimer],
  );

  const hideToast = useCallback(() => {
    clearTimer();
    setToast(null);
  }, [clearTimer]);

  useEffect(() => {
    if (!toast) return;
    if (typeof window === 'undefined') return;

    timeoutRef.current = window.setTimeout(() => {
      setToast(null);
      timeoutRef.current = null;
    }, TOAST_DURATION);

    return clearTimer;
  }, [toast, clearTimer]);

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      showToast,
      hideToast,
    }),
    [showToast, hideToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[1000] flex justify-center px-4 sm:justify-end sm:px-6">
        {toast ? (
          <Alert
            variant={toast.variant ?? 'default'}
            className="pointer-events-auto w-full max-w-sm shadow-lg"
          >
            <AlertTitle>{toast.title}</AlertTitle>
            {toast.description ? (
              <AlertDescription>{toast.description}</AlertDescription>
            ) : null}
          </Alert>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast deve ser usado dentro de <ToastProvider>');
  }
  return ctx;
}
