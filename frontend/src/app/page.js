import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Sistema de Agendamento</h1>
        <p className="text-zinc-600 mb-6">
          Escolha uma opção abaixo.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/agendar"
            className="bg-black text-white text-center py-3 rounded-xl"
          >
            Agendar horário
          </Link>

          <Link
            href="/admin/login"
            className="border border-zinc-300 text-center py-3 rounded-xl"
          >
            Entrar no painel
          </Link>
        </div>
      </div>
    </main>
  );
}