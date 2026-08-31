import axios, { AxiosError } from "axios";

const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: false,
});

function publicRequestError(error: unknown, fallback: string) {
  if (error instanceof AxiosError && error.response) {
    const data = error.response.data as { message?: string } | undefined;
    return new Error(data?.message ?? fallback);
  }

  return new Error(
    "Unable to reach Aurex. Check your connection and try again.",
  );
}

export async function sendContactMessage(body: {
  name: string;
  email: string;
  company?: string;
  message: string;
}) {
  try {
    const response = await publicApi.post<{ message?: string }>("/contact", {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      company: body.company?.trim() || undefined,
      message: body.message.trim(),
    });

    return response.data.message ?? "Your message has been sent.";
  } catch (error) {
    throw publicRequestError(error, "Unable to send your message.");
  }
}

export async function subscribeNewsletter(email: string) {
  try {
    const response = await publicApi.post<{ message?: string }>(
      "/newsletter/subscribe",
      { email: email.trim().toLowerCase() },
    );

    return response.data.message ?? "You are subscribed.";
  } catch (error) {
    throw publicRequestError(error, "Unable to subscribe right now.");
  }
}
