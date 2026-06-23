"use client";

import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCartAction, getHeaderMenuAction } from "./actions";
import Logo from "@/components/Logo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface MenuItem {
  label: string;
  url: string;
}

function CartIconWithCount() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const updateCartCount = async () => {
      try {
        const cart = await getCartAction();
        if (cart && cart.contents && cart.contents.nodes) {
          const totalItems = cart.contents.nodes.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
          setCount(totalItems);
          return;
        }
      } catch (e) {}

      try {
        const cartData = localStorage.getItem("byten_cart");
        if (cartData) {
          const parsed = JSON.parse(cartData);
          const totalItems = parsed.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
          setCount(totalItems);
        } else {
          setCount(0);
        }
      } catch (e) {
        setCount(0);
      }
    };

    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("byten_cart_update", updateCartCount);

    const interval = setInterval(updateCartCount, 2000);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("byten_cart_update", updateCartCount);
      clearInterval(interval);
    };
  }, []);

  return (
    <Link href="/checkout" style={{ position: "relative", padding: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "opacity 0.2s" }}>
      <svg
        xmlns="http://w3.org"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        style={{ width: "1.5rem", height: "1.5rem" }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        />
      </svg>
      {count > 0 && (
        <span style={{ position: "absolute", top: "-0.25rem", right: "-0.25rem", backgroundColor: "#dc2626", color: "#fff", fontSize: "0.75rem", fontWeight: "bold", borderRadius: "9999px", minWidth: "1.25rem", height: "1.25rem", padding: "0 0.25rem", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          {count}
        </span>
      )}
    </Link>
  );
}

function HeaderLogo() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
        <Logo width="190" height="40" />
        <span style={{ color: "#9ca3af", fontSize: "0.75rem", paddingLeft: "0.6rem" }}>Магазин цифровых кодов и доступов</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
      <Link href="/" style={{ textDecoration: "none", display: "inline-flex" }}>
        <Logo width="190" height="40" />
      </Link>
      <span style={{ color: "#9ca3af", fontSize: "0.75rem", paddingLeft: "0.6rem" }}>Магазин цифровых кодов и доступов</span>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const fetchMenu = async () => {
      const items = await getHeaderMenuAction();
      if (items && items.length > 0) {
        setMenuItems(items);
      } else {
        setMenuItems([
          { label: "Блог", url: "/blog" },
          { label: "Публичная оферта", url: "/terms" }
        ]);
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_API.language = 'ru';
    (window as any).Tawk_LoadStart = new Date();
    
    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script");
    s1.async = true;
    s1.src = 'https://tawk.to';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    
    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    } else {
      document.head.appendChild(s1);
    }
  }, []);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "#111827", color: "#fff", fontFamily: "sans-serif", margin: 0 }}>
        <header style={{ position: "sticky", top: 0, zIndex: 50, width: "100%", borderBottom: "1px solid #1f2937", backgroundColor: "rgba(17, 24, 39, 0.8)", backdropFilter: "blur(8px)" }}>
          <div style={{ maxWidth: "56rem", margin: "0 auto", padding: "0 1rem", height: "5.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <HeaderLogo />
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <nav className="hidden sm:flex" style={{ alignItems: "center", gap: "1.5rem" }}>
                {menuItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.url}
                    style={{ color: "#9ca3af", fontSize: "0.9rem", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              
              <CartIconWithCount />

              <button className="flex sm:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: "0.5rem" }}>
                {isMenuOpen ? (
                  <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "1.5rem", height: "1.5rem" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "1.5rem", height: "1.5rem" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div style={{ display: "flex", flexDirection: "column", backgroundColor: "#111827", borderBottom: "1px solid #1f2937", padding: "1rem", gap: "1rem" }}>
              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.url}
                  style={{ color: "#9ca3af", fontSize: "1rem", textDecoration: "none", fontWeight: 500, padding: "0.5rem 0" }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </header>
        
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
