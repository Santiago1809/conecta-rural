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
  metadataBase: new URL("https://mi-ruta-antioquia.vercel.app"),
  title: {
    default: "Mi Ruta · Tu próxima aventura está más cerca",
    template: "%s · Mi Ruta",
  },
  description:
    "Descubre destinos rurales de Antioquia con rutas reales, clima en vivo y contacto directo con quienes te reciben.",
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Mi Ruta",
    title: "Mi Ruta · Tu próxima aventura está más cerca",
    description:
      "Descubre destinos rurales de Antioquia con rutas reales, clima en vivo y contacto directo con quienes te reciben.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mi Ruta · Tu próxima aventura está más cerca",
    description:
      "Descubre destinos rurales de Antioquia con rutas reales, clima en vivo y contacto directo con quienes te reciben.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${headline.variable} ${body.variable} h-full`}
    >
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col bg-canvas font-body text-ink antialiased"
      >
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
