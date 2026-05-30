import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LidiaLabs — Onboarding",
  description: "Configura tu agente Lidia. Cuéntanos sobre tu negocio y lo dejamos listo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
