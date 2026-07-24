import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "SOS Oficina | Angelin Espinoza",
  description:
    "Reto interactivo de soporte IT, redes y seguridad creado por Angelin Espinoza.",
  openGraph: {
    title: "SOS Oficina | Angelin Espinoza",
    description:
      "La oficina abre en 5 minutos. ¿Puedes salvar la red?",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: "/og.png",
        width: 1536,
        height: 1024,
        alt: "SOS Oficina, reto interactivo de soporte IT de Angelin Espinoza",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SOS Oficina | Angelin Espinoza",
    description: "La oficina abre en 5 minutos. ¿Puedes salvar la red?",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
