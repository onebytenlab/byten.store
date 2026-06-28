import { Geist, Geist_Mono } from "next/font/google";
import { getHeaderMenuAction, getGeneralSettingsAction } from "./actions";
import Header from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let menuItems = [];
  let siteSettings = { title: "BYTEN.ONLINE", description: "Магазин цифровых кодов и доступов" };

  try {
    const [items, settings] = await Promise.all([
      getHeaderMenuAction(),
      getGeneralSettingsAction()
    ]);

    if (items && items.length > 0) {
      menuItems = items;
    } else {
      menuItems = [
        { label: "Блог", url: "/blog" },
        { label: "Публичная оферта", url: "/terms" }
      ];
    }

    if (settings) {
      siteSettings = {
        title: settings.title || "BYTEN.ONLINE",
        description: settings.description || "Магазин цифровых кодов и доступов"
      };
    }
  } catch (e) {
    menuItems = [
      { label: "Блог", url: "/blog" },
      { label: "Публичная оферта", url: "/terms" }
    ];
  }

  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "#111827", color: "#fff", fontFamily: "sans-serif", margin: 0 }}>
        <Header initialMenuItems={menuItems} siteSettings={siteSettings} />
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
