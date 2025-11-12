import { useNavigate } from '../router';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-50 text-stone-700">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <p className="text-sm text-stone-500">
        A rota acessada não existe ou foi movida.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm shadow hover:opacity-95 transition"
      >
        Voltar para o início
      </button>
    </div>
  );
}
