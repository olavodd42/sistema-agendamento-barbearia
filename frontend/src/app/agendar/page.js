"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function AgendarPage() {
  const [date, setDate] = useState("");
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
    async function loadSlots() {
      if (!date) {
        setSlots([]);
        return;
      }

      try {
        setLoadingSlots(true);
        setMessage("");
        setMessageType("info");
        const data = await apiFetch(`/appointments/available?date=${date}`);
        setSlots(data);
      } catch (error) {
        setMessage(error.message);
        setMessageType("error");
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, [date]);

  function handleChange(e) {
    setForm((old) => ({
      ...old,
      [e.target.name]: e.target.value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

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
      setSlots(updatedSlots);
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-900 p-6 flex justify-center">
      <div className="w-full max-w-xl bg-white text-zinc-900 rounded-2xl shadow-md p-6">
        <h1 className="text-2xl text-zinc-900 font-bold mb-6">Agendar horário</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 text-zinc-800 font-medium">Data</label>
            <input
              type="date"
              className="w-full border border-zinc-300 bg-white text-zinc-900 rounded-xl px-4 py-3"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSelectedTime("");
              }}
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-zinc-800 font-medium">Horários disponíveis</label>

            {loadingSlots && (
              <p className="text-sm text-zinc-600">Carregando horários...</p>
            )}

            {!loadingSlots && date && slots.length === 0 && (
              <p className="text-sm text-zinc-600">Nenhum horário disponível.</p>
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
                      : "bg-white text-black border-zinc-300"
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
            disabled={submitting}
            className="bg-black text-white py-3 rounded-xl"
          >
            {submitting ? "Agendando..." : "Confirmar agendamento"}
          </button>

          {message && (
            <p
              className={`text-sm text-center ${
                messageType === "success" ? "text-green-700" : "text-red-700"
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