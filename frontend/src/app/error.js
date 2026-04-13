"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("[frontend-error]", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900 p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-lg text-center">
        <p className="text-sm uppercase tracking-wide text-red-600 font-semibold mb-2">
          Ops, algo deu errado
        </p>
        <h1 className="text-2xl font-bold mb-3">Erro inesperado na aplicação</h1>
        <p className="text-zinc-600 mb-6">
          Você pode tentar novamente agora. Se o problema persistir, recarregue a página.
        </p>

        <button
          type="button"
          onClick={reset}
          className="bg-black text-white px-5 py-3 rounded-xl"
        >
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
