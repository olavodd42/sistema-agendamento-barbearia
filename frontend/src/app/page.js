import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-100 p-6 flex items-center justify-center">
      <section className="w-full max-w-3xl bg-white p-8 rounded-3xl shadow-lg">
        <p className="text-sm uppercase tracking-wide text-zinc-500 font-semibold mb-2">
          BarberFlow
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Sistema de agendamento para barbearia
        </h1>
        <p className="text-zinc-600 mb-8">
          Projeto full-stack com foco em experiência do cliente, organização da agenda e robustez no backend.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="border border-zinc-200 rounded-2xl p-4">
            <h2 className="font-semibold mb-1">Cliente</h2>
            <p className="text-sm text-zinc-600">Consulta horários disponíveis em tempo real e agenda em poucos cliques.</p>
          </div>
          <div className="border border-zinc-200 rounded-2xl p-4">
            <h2 className="font-semibold mb-1">Administração</h2>
            <p className="text-sm text-zinc-600">Painel autenticado para acompanhar agenda diária e atualizar status dos atendimentos.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/agendar"
            className="bg-black text-white text-center py-3 px-5 rounded-xl"
          >
            Agendar horário
          </Link>

          <Link
            href="/admin/login"
            className="border border-zinc-300 text-center py-3 px-5 rounded-xl"
          >
            Entrar no painel administrativo
          </Link>
        </div>
      </section>
    </main>
  );
}