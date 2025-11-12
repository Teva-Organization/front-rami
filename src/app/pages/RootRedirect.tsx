import { useEffect } from 'react';
import { useNavigate } from '../router';

export default function RootRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return null;
}
