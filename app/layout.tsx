import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meit - Sistema de Lealtad",
  description: "Plataforma de gestión de puntos y recompensas para negocios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#ffffff',
              border: '1px solid #eeeeee',
              borderRadius: '20px',
              padding: '16px',
            },
            className: 'toast-custom',
          }}
        />
      </body>
    </html>
  );
}
