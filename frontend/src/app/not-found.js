import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900 p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-lg text-center">
        <p className="text-sm uppercase tracking-wide text-zinc-500 font-semibold mb-2">Erro 404</p>
        <h1 className="text-2xl font-bold mb-3">Página não encontrada</h1>
        <p className="text-zinc-600 mb-6">
          O caminho informado não existe. Você pode voltar para a página inicial.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center bg-black text-white px-5 py-3 rounded-xl"
        >
          Voltar para início
        </Link>
      </div>
    </main>
  );
}
