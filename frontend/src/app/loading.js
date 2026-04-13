export default function GlobalLoading() {
  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900 p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">
        <p className="text-zinc-600 mb-2">Carregando aplicação...</p>
        <div className="w-full h-2 rounded-full bg-zinc-200 overflow-hidden">
          <div className="h-full w-1/2 bg-zinc-900 animate-pulse" />
        </div>
      </div>
    </main>
  );
}
