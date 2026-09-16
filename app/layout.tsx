import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const headline = Plus_Jakarta_Sans({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://conecta-rural-antioquia-santiago1809s-projects.vercel.app",
  ),
  title: {
    default: "Conecta Rural · Descubre lo mejor del campo",
    template: "%s · Conecta Rural",
  },
  description:
    "Turismo comunitario en Antioquia con prestadores verificados, rutas reales y WhatsApp directo para descubrir lo mejor del campo.",
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Conecta Rural",
    title: "Conecta Rural · Descubre lo mejor del campo",
    description:
      "Turismo comunitario en Antioquia con prestadores verificados, rutas reales y WhatsApp directo para descubrir lo mejor del campo.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Conecta Rural · Descubre lo mejor del campo",
    description:
      "Turismo comunitario en Antioquia con prestadores verificados, rutas reales y WhatsApp directo para descubrir lo mejor del campo.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${headline.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-canvas font-body text-ink antialiased">
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
