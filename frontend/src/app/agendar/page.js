"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";

function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizePhoneInput(value) {
  return value.replace(/[^\d()\-+\s]/g, "").slice(0, 20);
}

function formatDateLabel(date) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full"
  }).format(new Date(`${date}T00:00:00`));
}

export default function AgendarPage() {
  const minDate = useMemo(() => todayString(), []);

  const [date, setDate] = useState(minDate);
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    notes: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    const lastScheduledDate = localStorage.getItem("lastScheduledDate");

    if (lastScheduledDate && lastScheduledDate >= minDate) {
      setDate(lastScheduledDate);
    }
  }, [minDate]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSlots() {
      if (!date) {
        setSlots([]);
        return;
      }

      try {
        setLoadingSlots(true);
        setMessage("");
        setMessageType("info");

        const data = await apiFetch(`/appointments/available?date=${date}`, {
          signal: controller.signal
        });

        setSlots(Array.isArray(data) ? data : []);
        setSelectedTime((current) => (data?.includes(current) ? current : ""));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setMessage(error.message);
        setMessageType("error");
        setSlots([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSlots(false);
        }
      }
    }

    loadSlots();

    return () => {
      controller.abort();
    };
  }, [date]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((old) => ({
      ...old,
      [name]: name === "phone" ? normalizePhoneInput(value) : value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!date) {
      setMessage("Selecione uma data.");
      setMessageType("error");
      return;
    }

    if (date < minDate) {
      setMessage("Selecione uma data de hoje em diante.");
      setMessageType("error");
      return;
    }

    if (!selectedTime) {
      setMessage("Selecione um horário.");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      setMessageType("info");

      await apiFetch("/appointments", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          date,
          time: selectedTime
        })
      });

      setMessage("Agendamento criado com sucesso.");
      setMessageType("success");
      localStorage.setItem("lastScheduledDate", date);
      setForm({
        name: "",
        phone: "",
        email: "",
        notes: ""
      });
      setSelectedTime("");

      const updatedSlots = await apiFetch(`/appointments/available?date=${date}`);
      setSlots(Array.isArray(updatedSlots) ? updatedSlots : []);
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-200/50 text-zinc-900 p-6 flex justify-center">
      <div className="w-full max-w-xl bg-white text-zinc-900 rounded-3xl shadow-lg border border-zinc-200 p-6 md:p-7">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium border border-zinc-300 px-3 py-2 rounded-xl hover:bg-zinc-100 transition"
          >
            <span aria-hidden>←</span>
            Voltar
          </Link>

          <span className="text-xs text-zinc-500">Atendimento: 09h às 18h</span>
        </div>

        <h1 className="text-2xl text-zinc-900 font-bold mb-6">Agendar horário</h1>
        <p className="text-sm text-zinc-600 mb-6">
          Selecione uma data, escolha o horário e preencha seus dados para concluir.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 text-zinc-800 font-medium">Data</label>
            <input
              type="date"
              className="w-full border border-zinc-300 bg-white text-zinc-900 rounded-xl px-4 py-3"
              value={date}
              min={minDate}
              onChange={(e) => {
                setDate(e.target.value);
                setSelectedTime("");
                setMessage("");
              }}
              required
            />

            {date && (
              <p className="text-xs text-zinc-500 mt-2">
                {formatDateLabel(date)}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-zinc-800 font-medium">Horários disponíveis</label>

            {loadingSlots && (
              <p className="text-sm text-zinc-600">Carregando horários...</p>
            )}

            {!loadingSlots && date && slots.length === 0 && (
              <p className="text-sm text-zinc-600">Nenhum horário disponível para essa data.</p>
            )}

            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`py-2 rounded-xl border ${
                    selectedTime === slot
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-zinc-300 hover:bg-zinc-100"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-1 text-zinc-800 font-medium">Nome</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-500 rounded-xl px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-zinc-800 font-medium">Telefone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              inputMode="numeric"
              placeholder="(11) 99999-9999"
              className="w-full border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-500 rounded-xl px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-zinc-800 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-500 rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block mb-1 text-zinc-800 font-medium">Observações</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-500 rounded-xl px-4 py-3"
              rows={4}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !date || !selectedTime}
            className="bg-black text-white py-3 rounded-xl hover:bg-zinc-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Agendando..." : "Confirmar agendamento"}
          </button>

          {selectedTime && (
            <p className="text-xs text-zinc-600 text-center">
              Horário selecionado: <strong>{selectedTime}</strong>
            </p>
          )}

          {message && (
            <p
              className={`text-sm text-center ${
                messageType === "success"
                  ? "text-green-700"
                  : messageType === "error"
                    ? "text-red-700"
                    : "text-zinc-700"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}