import AuthScreen from '../../features/auth/pages/AuthScreen';
import { useNavigate } from '../router';

export default function SignIn() {
  const navigate = useNavigate();

  return (
    <AuthScreen onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
  );
}
