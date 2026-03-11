"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Home, Clock, BarChart3, Map, Settings, Search, Sun, Moon, X } from "lucide-react";
import { NavBar } from "./tubelight-navbar";
import { useTheme } from "./ThemeProvider";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/timeline", label: "Timeline" },
  { href: "/insights", label: "Insights" },
  { href: "/map", label: "Map" },
  { href: "/settings", label: "Settings" },
];

const tubelightItems = [
  { name: "Home", url: "/", icon: Home },
  { name: "Timeline", url: "/timeline", icon: Clock },
  { name: "Insights", url: "/insights", icon: BarChart3 },
  { name: "Map", url: "/map", icon: Map },
  { name: "Settings", url: "/settings", icon: Settings },
];

function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Moon size={16} strokeWidth={2} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Sun size={16} strokeWidth={2} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

function SearchButton() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const applySearch = useCallback((q: string) => {
    const cards = document.querySelectorAll("[data-memory-card]");
    if (!q.trim()) {
      cards.forEach((card) => {
        (card as HTMLElement).style.opacity = "1";
        (card as HTMLElement).style.filter = "";
        (card as HTMLElement).style.borderColor = "";
      });
      return;
    }
    const lower = q.toLowerCase();
    cards.forEach((card) => {
      const text = (card as HTMLElement).textContent?.toLowerCase() || "";
      if (text.includes(lower)) {
        (card as HTMLElement).style.opacity = "1";
        (card as HTMLElement).style.filter = "brightness(1.1)";
        (card as HTMLElement).style.borderColor = "rgba(255,255,255,0.5)";
      } else {
        (card as HTMLElement).style.opacity = "0.3";
        (card as HTMLElement).style.filter = "";
        (card as HTMLElement).style.borderColor = "";
      }
    });
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        setQuery("");
        applySearch("");
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, applySearch]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
        aria-label="Search"
      >
        <Search size={16} strokeWidth={2} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-16 sm:top-20 left-0 right-0 z-50 overflow-hidden"
          >
            <div className="glass-strong px-6 py-4">
              <div className="max-w-xl mx-auto flex items-center gap-3">
                <Search size={16} className="text-foreground/40 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    applySearch(e.target.value);
                  }}
                  placeholder="Search memories..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground/30 outline-none font-body font-light"
                />
                <button
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                    applySearch("");
                  }}
                  className="text-foreground/40 hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const extraActions = (
    <>
      <SearchButton />
      <ThemeToggle />
    </>
  );

  return (
    <>
      {/* Desktop: Tubelight Navbar */}
      <div className="hidden md:block">
        <NavBar items={tubelightItems} extraActions={extraActions} />
      </div>

      {/* Mobile: hamburger nav with fullscreen overlay */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 md:hidden transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-xl bg-chrono-bg/90 border-b border-white/[0.12] py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-foreground/60 text-base leading-none select-none">&#x2022;</span>
            <span className="text-[13px] font-display font-bold tracking-[0.25em] uppercase text-chrono-text">
              Chrono
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <SearchButton />
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex flex-col gap-1.5 p-2"
            >
              <motion.span
                animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 6 : 0 }}
                className="w-5 h-[1px] bg-foreground/80 block"
              />
              <motion.span
                animate={{ opacity: mobileOpen ? 0 : 1 }}
                className="w-5 h-[1px] bg-foreground/80 block"
              />
              <motion.span
                animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -6 : 0 }}
                className="w-5 h-[1px] bg-foreground/80 block"
              />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Fullscreen Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-chrono-bg/98 backdrop-blur-2xl pt-24 px-8 md:hidden"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block text-3xl font-display font-bold py-3 ${
                      pathname === item.href
                        ? "text-foreground"
                        : "text-chrono-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-12 flex flex-col gap-4">
              <button className="w-full py-3 text-sm font-body font-light text-chrono-muted border border-chrono-border rounded-full">
                Sign In
              </button>
              <button className="w-full py-3 text-sm font-body font-light bg-foreground text-background rounded-full">
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
