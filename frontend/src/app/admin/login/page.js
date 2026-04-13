"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/api";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));

      router.push("/admin/agenda");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-200/50 text-zinc-900 flex items-center justify-center p-6">
      <div className="bg-white text-zinc-900 rounded-3xl shadow-lg border border-zinc-200 p-6 w-full max-w-md">
        <div className="mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium border border-zinc-300 px-3 py-2 rounded-xl hover:bg-zinc-100 transition"
          >
            <span aria-hidden>←</span>
            Voltar
          </Link>
        </div>

        <h1 className="text-2xl text-zinc-900 font-bold mb-6">Login do admin</h1>
        <p className="text-sm text-zinc-600 mb-6">
          Use as credenciais de administrador para acessar o painel.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 text-zinc-800 font-medium">Email</label>
            <input
              type="email"
              className="w-full border border-zinc-300 bg-white text-zinc-900 rounded-xl px-4 py-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@barberflow.com"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-zinc-800 font-medium">Senha</label>
            <input
              type="password"
              className="w-full border border-zinc-300 bg-white text-zinc-900 rounded-xl px-4 py-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="bg-black text-white py-3 rounded-xl hover:bg-zinc-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {message && (
            <p className="text-sm text-center text-red-600">{message}</p>
          )}
        </form>
      </div>
    </main>
  );
}