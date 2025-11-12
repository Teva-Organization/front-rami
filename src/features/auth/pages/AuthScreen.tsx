import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import type { LoginCreateDto, RegisterCreateDto } from '../model/auth';
import Logo from '../../../shared/ui/Logo';
import { useNavigate } from '../../../app/router';
import { useToast } from '../../../shared/ui/ToastProvider';

type AuthScreenProps = {
  onLoginSuccess?: () => void;
};

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const handleLogin = async (data: LoginCreateDto) => {
    setLoading(true);
    try {
      const result = await login(data);
      if (result.success) {
        showToast({
          title: 'Login realizado com sucesso!',
        });
        onLoginSuccess?.();
      } else if (result.error) {
        showToast({
          title: 'Erro ao entrar',
          description: result.error,
          variant: 'destructive',
        });
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterCreateDto) => {
    setLoading(true);
    try {
      const result = await register(data);
      if (result.success) {
        setIsLogin(true);
        navigate('/signin', { replace: true });
        showToast({
          title: 'Cadastro realizado com sucesso',
          description: 'Faça login para acessar sua conta.',
        });
      } else if (result.error) {
        showToast({
          title: 'Erro ao cadastrar',
          description: result.error,
          variant: 'destructive',
        });
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Logo withText size={54} />
          <p className="mt-1 text-sm text-neutral-600">Seu companheiro no campo.</p>
        </div>
        {isLogin ? (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToRegister={() => setIsLogin(false)}
            loading={loading}
          />
        ) : (
          <RegisterForm
            onRegister={handleRegister}
            onSwitchToLogin={() => setIsLogin(true)}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
