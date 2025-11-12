import React from 'react';
import { Settings, Workflow, ListTodo, Sprout } from 'lucide-react';
import { useNavigate } from '@/app/router';

const cards = [
  {
    title: 'Atividades',
    description: 'Gerencie atividades, prazos e descrições.',
    url: '/configuracoes/atividades',
    icon: ListTodo,
  },
  {
    title: 'Fluxos',
    description: 'Organize fluxos, atividades vinculadas e transições.',
    url: '/configuracoes/fluxos',
    icon: Workflow,
  },
  {
    title: 'Culturas',
    description: 'Cadastre e mantenha as culturas disponíveis.',
    url: '/configuracoes/culturas',
    icon: Sprout,
  },
];

export default function ConfiguracoesLanding() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 text-stone-900">
      <section className="rounded-3xl border border-emerald-100 bg-white px-6 py-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Settings />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Configurações
            </p>
            <h1 className="text-2xl font-semibold text-stone-900">
              Fluxos de trabalho
            </h1>
            <p className="text-sm text-stone-500">
              Escolha qual entidade deseja administrar para manter os processos
              atualizados.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.url}
              type="button"
              onClick={() => navigate(card.url)}
              className="flex h-full flex-col items-start gap-3 rounded-3xl border border-stone-200 bg-white px-5 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-emerald-600">
                    {card.title}
                  </p>
                  <p className="text-xs text-stone-500">{card.description}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-stone-900">
                Acessar
              </span>
            </button>
          );
        })}
      </section>
    </div>
  );
}
