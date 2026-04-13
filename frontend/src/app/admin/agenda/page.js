"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/api";

function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AdminAgendaPage() {
  const router = useRouter();

  const [date, setDate] = useState(todayString());
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadAppointments(selectedDate) {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      const data = await apiFetch(`/appointments?date=${selectedDate}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAppointments(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments(date);
  }, [date]);

  async function updateStatus(id, status) {
    try {
      const token = localStorage.getItem("token");

      await apiFetch(`/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      await loadAppointments(date);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    router.push("/admin/login");
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Painel de agendamentos</h1>

          <div className="flex gap-3">
            <input
              type="date"
              className="border rounded-xl px-4 py-3"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <button
              onClick={logout}
              className="border border-zinc-300 px-4 py-3 rounded-xl"
            >
              Sair
            </button>
          </div>
        </div>

        {loading && <p>Carregando...</p>}

        {!loading && appointments.length === 0 && (
          <p className="text-zinc-500">Nenhum agendamento nesta data.</p>
        )}

        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border border-zinc-200 rounded-2xl p-4"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="font-bold">{appointment.customer.name}</p>
                  <p className="text-sm text-zinc-600">
                    {appointment.customer.phone}
                  </p>
                  {appointment.customer.email && (
                    <p className="text-sm text-zinc-600">
                      {appointment.customer.email}
                    </p>
                  )}
                  <p className="text-sm mt-2">
                    Horário:{" "}
                    {new Date(appointment.date).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                  <p className="text-sm">
                    Status: <strong>{appointment.status}</strong>
                  </p>
                  {appointment.notes && (
                    <p className="text-sm mt-2">Obs: {appointment.notes}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateStatus(appointment.id, "DONE")}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl"
                  >
                    Concluir
                  </button>

                  <button
                    onClick={() => updateStatus(appointment.id, "CANCELED")}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl"
                  >
                    Cancelar
                  </button>

                  <a
                    href={`https://wa.me/55${appointment.customer.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-zinc-300 px-4 py-2 rounded-xl"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {message && (
          <p className="text-sm text-red-600 mt-4">{message}</p>
        )}
      </div>
    </main>
  );
}