import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "BarberFlow | Sistema de Agendamento",
    template: "%s | BarberFlow"
  },
  description: "Aplicação full-stack para gestão de agendamentos em barbearia, com painel administrativo, autenticação e API segura.",
  applicationName: "BarberFlow",
  keywords: [
    "agendamento",
    "barbearia",
    "next.js",
    "express",
    "prisma",
    "portfolio"
  ]
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
