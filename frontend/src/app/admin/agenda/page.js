"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/api";

function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const STATUS_LABELS = {
  SCHEDULED: "Agendado",
  DONE: "Concluído",
  CANCELED: "Cancelado"
};

const STATUS_STYLES = {
  SCHEDULED: "bg-amber-100 text-amber-800",
  DONE: "bg-emerald-100 text-emerald-800",
  CANCELED: "bg-rose-100 text-rose-800"
};

function formatHour(date) {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function AdminAgendaPage() {
  const router = useRouter();

  const [date, setDate] = useState(todayString());
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(true);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState("");

  useEffect(() => {
    const lastScheduledDate = localStorage.getItem("lastScheduledDate");

    if (lastScheduledDate) {
      setDate(lastScheduledDate);
    }
  }, []);

  const loadAppointments = useCallback(async (selectedDate) => {
    try {
      setLoading(true);
      setMessage("");
      setMessageType("info");

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
      if (error.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");
        router.push("/admin/login");
        return;
      }

      setMessage(error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadAppointments(date);
  }, [date, loadAppointments]);

  async function updateStatus(id, status) {
    try {
      setUpdatingAppointmentId(id);
      setMessage("");
      setMessageType("info");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      await apiFetch(`/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      await loadAppointments(date);
      setMessage("Status atualizado com sucesso.");
      setMessageType("success");
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setUpdatingAppointmentId("");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    router.push("/admin/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-200/50 text-zinc-900 p-6">
      <div className="max-w-5xl mx-auto bg-white text-zinc-900 rounded-3xl shadow-lg border border-zinc-200 p-6">
        <div className="mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium border border-zinc-300 px-3 py-2 rounded-xl hover:bg-zinc-100 transition"
          >
            <span aria-hidden>←</span>
            Voltar
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl text-zinc-900 font-bold">Painel de agendamentos</h1>
            <p className="text-sm text-zinc-600 mt-1">
              {appointments.length} agendamento(s) para a data selecionada
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="date"
              className="border border-zinc-300 bg-white text-zinc-900 rounded-xl px-4 py-3"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <button
              onClick={logout}
              className="border border-zinc-300 text-zinc-800 px-4 py-3 rounded-xl hover:bg-zinc-100 transition"
            >
              Sair
            </button>
          </div>
        </div>

        {loading && <p>Carregando...</p>}

        {!loading && appointments.length === 0 && (
          <p className="text-zinc-600">Nenhum agendamento nesta data.</p>
        )}

        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border border-zinc-200 rounded-2xl p-4 bg-zinc-50/40"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="font-bold">{appointment.customer.name}</p>
                  <p className="text-sm text-zinc-700">
                    {appointment.customer.phone}
                  </p>
                  {appointment.customer.email && (
                    <p className="text-sm text-zinc-700">
                      {appointment.customer.email}
                    </p>
                  )}
                  <p className="text-sm mt-2">
                    Horário:{" "}
                    {formatHour(appointment.date)}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium mt-2 ${
                      STATUS_STYLES[appointment.status] ?? "bg-zinc-100 text-zinc-800"
                    }`}
                  >
                    {STATUS_LABELS[appointment.status] ?? appointment.status}
                  </span>
                  {appointment.notes && (
                    <p className="text-sm mt-2">Obs: {appointment.notes}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateStatus(appointment.id, "DONE")}
                    disabled={updatingAppointmentId === appointment.id}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Concluir
                  </button>

                  <button
                    onClick={() => updateStatus(appointment.id, "CANCELED")}
                    disabled={updatingAppointmentId === appointment.id}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>

                  <a
                    href={`https://wa.me/55${appointment.customer.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-zinc-300 px-4 py-2 rounded-xl hover:bg-zinc-100 transition"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {message && (
          <p
            className={`text-sm mt-4 ${
              messageType === "success" ? "text-green-700" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}