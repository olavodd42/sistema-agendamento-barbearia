export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
const API_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 12000);

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => ({}));
  }

  const text = await response.text().catch(() => "");

  if (!text) {
    return {};
  }

  return { message: text };
}

export async function apiFetch(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = {
    ...(options.headers || {})
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT_MS);

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  if (
    options.body &&
    !headers["Content-Type"] &&
    !headers["content-type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      method,
      headers,
      signal: controller.signal,
      cache: method === "GET" ? "no-store" : options.cache
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      const error = new Error(
        data?.message || `Erro na requisição (${response.status}).`
      );
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("A requisição demorou demais. Tente novamente.");
    }

    if (error instanceof TypeError) {
      throw new Error("Não foi possível conectar ao servidor.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}