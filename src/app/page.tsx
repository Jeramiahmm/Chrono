"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import LoadingScreen from "@/components/ui/LoadingScreen";

const PHOTOS = [
  { src: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80", alt: "New York City" },
  { src: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&q=80", alt: "Los Angeles" },
  { src: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80", alt: "Golden Gate Bridge" },
  { src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80", alt: "Road trip" },
  { src: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80", alt: "Skiing in Vail" },
  { src: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800&q=80", alt: "San Francisco" },
];

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function SlideIn({ children, delay = 0, from = "left", className = "" }: { children: React.ReactNode; delay?: number; from?: "left" | "right"; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, x: from === "left" ? -60 : 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay, duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function ScaleIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end center"] });

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      setCount(Math.round(v * value));
    });
  }, [scrollYProgress, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const HERO_WORDS = ["beautifully", "elegantly"] as const;

function HeroSection() {
  const { data: session, status } = useSession();
  const [wordIdx, setWordIdx] = useState(0);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const t = setInterval(() => setWordIdx((i) => (i + 1) % HERO_WORDS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleCTA = () => {
    if (status !== "loading" && session) window.location.href = "/timeline";
    else signIn("google", { callbackUrl: "/timeline" });
  };

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Floating colored circles */}
      <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[15%] left-[10%] w-72 h-72 rounded-full bg-gradient-to-br from-amber-200/40 to-orange-200/20 blur-3xl pointer-events-none" />
      <motion.div animate={{ y: [0, 15, 0], x: [0, -15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[20%] right-[8%] w-80 h-80 rounded-full bg-gradient-to-br from-violet-200/30 to-purple-300/20 blur-3xl pointer-events-none" />
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[40%] right-[25%] w-40 h-40 rounded-full bg-gradient-to-br from-emerald-200/30 to-teal-200/20 blur-2xl pointer-events-none" />
      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }} className="mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-chrono-accent/10 text-chrono-accent text-xs font-body font-bold tracking-widest uppercase">Your life, visualized</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="font-display tracking-tight text-chrono-text" style={{ fontSize: "clamp(3.5rem, 10vw, 7.5rem)", lineHeight: 1.05, fontWeight: 500 }}>
          <span className="block">Your life,</span>
          <span className="block">
            <span className="inline-block relative align-bottom overflow-visible" style={{ lineHeight: "inherit", paddingRight: "0.08em" }}>
              <span className="invisible italic">beautifully</span>
              <AnimatePresence mode="wait">
                <motion.span key={HERO_WORDS[wordIdx]} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 italic text-chrono-accent text-right" style={{ lineHeight: "inherit" }}>
                  {HERO_WORDS[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </span>{" "}
            <span className="font-black">mapped</span>
          </span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }} className="text-lg md:text-xl font-body max-w-lg mx-auto leading-relaxed text-chrono-text/60 mt-8">
          The visual timeline that turns memories into clear, beautiful stories.
        </motion.p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <button onClick={handleCTA} className="group inline-flex cursor-pointer items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-body font-medium bg-chrono-accent text-white hover:opacity-90 active:scale-[0.98] shadow-[0_2px_16px_rgba(61,90,68,0.3)] transition-all duration-300">
            Get Started <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          <Link href="/insights" className="px-8 py-3.5 text-chrono-text/70 hover:text-chrono-text border border-chrono-text/15 hover:border-chrono-text/30 rounded-xl transition-all text-sm font-body font-medium">
            View Insights
          </Link>
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mt-6 text-sm font-body text-chrono-text/40">Free to start. No credit card required.</motion.p>
      </motion.div>
    </section>
  );
}

function PhotoParallaxSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [80, -30]);

  return (
    <section ref={ref} className="relative py-20 md:py-32 px-6 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--line)] to-transparent" />
      <FadeUp className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-display tracking-tight text-chrono-text" style={{ fontWeight: 600 }}>
          <span className="italic text-chrono-accent">Every moment</span> deserves<br />a beautiful canvas
        </h2>
        <p className="text-base md:text-lg font-body text-chrono-text/55 mt-6 max-w-xl mx-auto leading-relaxed">
          Capture, organize, and relive — turning scattered moments into a cohesive life story.
        </p>
      </FadeUp>
      {/* Bento grid — organized, intentional layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-4 md:grid-cols-12 gap-3 md:gap-4 auto-rows-[160px] md:auto-rows-[200px]">
        <motion.div style={{ y: y1 }} whileHover={{ scale: 1.03 }} className="relative col-span-2 md:col-span-5 row-span-2 rounded-2xl overflow-hidden shadow-xl cursor-pointer group">
          <Image src={PHOTOS[0].src} alt={PHOTOS[0].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="40vw" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className="absolute bottom-4 left-4 text-white text-sm font-display font-semibold">{PHOTOS[0].alt}</span>
        </motion.div>
        <motion.div style={{ y: y2 }} whileHover={{ scale: 1.03 }} className="relative col-span-2 md:col-span-4 row-span-1 rounded-2xl overflow-hidden shadow-xl cursor-pointer group">
          <Image src={PHOTOS[1].src} alt={PHOTOS[1].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="33vw" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className="absolute bottom-4 left-4 text-white text-sm font-display font-semibold">{PHOTOS[1].alt}</span>
        </motion.div>
        <motion.div style={{ y: y1 }} whileHover={{ scale: 1.03 }} className="relative col-span-2 md:col-span-3 row-span-2 rounded-2xl overflow-hidden shadow-xl cursor-pointer group">
          <Image src={PHOTOS[2].src} alt={PHOTOS[2].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="25vw" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className="absolute bottom-4 left-4 text-white text-sm font-display font-semibold">{PHOTOS[2].alt}</span>
        </motion.div>
        <motion.div style={{ y: y2 }} whileHover={{ scale: 1.03 }} className="relative col-span-2 md:col-span-4 row-span-1 rounded-2xl overflow-hidden shadow-xl cursor-pointer group">
          <Image src={PHOTOS[3].src} alt={PHOTOS[3].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="33vw" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className="absolute bottom-4 left-4 text-white text-sm font-display font-semibold">{PHOTOS[3].alt}</span>
        </motion.div>
      </div>
    </section>
  );
}

function ColorMarquee() {
  const words = [
    { text: "memories", color: "text-amber-500" },
    { text: "milestones", color: "text-violet-500" },
    { text: "adventures", color: "text-emerald-500" },
    { text: "chapters", color: "text-rose-500" },
    { text: "places", color: "text-blue-500" },
    { text: "growth", color: "text-teal-500" },
    { text: "stories", color: "text-orange-500" },
    { text: "journeys", color: "text-indigo-500" },
  ];
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf: number, x = 0;
    const animate = () => {
      if (!trackRef.current) return;
      x -= 0.5;
      const half = trackRef.current.scrollWidth / 2;
      if (Math.abs(x) >= half) x += half;
      trackRef.current.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="w-full overflow-hidden py-6 border-y border-[var(--line)]">
      <div ref={trackRef} className="flex whitespace-nowrap will-change-transform">
        {Array.from({ length: 4 }).map((_, setIdx) => (
          <div key={setIdx} className="flex items-center">
            {words.map((w) => (
              <span key={`${setIdx}-${w.text}`} className="flex items-center mx-5">
                <span className={`w-2 h-2 rounded-full ${w.color} opacity-60 mr-5`} />
                <span className={`font-display italic text-lg tracking-wide ${w.color} opacity-70`}>{w.text}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturesSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const xLeft = useTransform(scrollYProgress, [0, 1], [-30, 0]);
  const xRight = useTransform(scrollYProgress, [0, 1], [30, 0]);

  const features = [
    { title: "Timeline", desc: "Every moment organized chronologically — a living record that grows with you.", photo: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80", accent: "text-emerald-600", dot: "bg-emerald-500", bg: "bg-emerald-50/50 dark:bg-emerald-950/20" },
    { title: "Life Stories", desc: "Narratives crafted from your real experiences. Your story, told beautifully.", photo: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80", accent: "text-violet-600", dot: "bg-violet-500", bg: "bg-violet-50/50 dark:bg-violet-950/20" },
    { title: "Life Map", desc: "See where your life happened — every pin is a memory on an interactive globe.", photo: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80", accent: "text-amber-600", dot: "bg-amber-500", bg: "bg-amber-50/50 dark:bg-amber-950/20" },
    { title: "Insights", desc: "Discover patterns you never saw — most active years, favorite places, milestones.", photo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80", accent: "text-blue-600", dot: "bg-blue-500", bg: "bg-blue-50/50 dark:bg-blue-950/20" },
  ];

  return (
    <section ref={ref} className="relative py-24 md:py-40 px-6 overflow-hidden bg-chrono-surface/30">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--line)] to-transparent" />
      <div className="max-w-6xl mx-auto">
        <FadeUp className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-display tracking-tight text-chrono-text" style={{ fontWeight: 700 }}>
            Everything you need
          </h2>
        </FadeUp>
        <div className="space-y-6">
          {features.map((f, i) => {
            const isEven = i % 2 === 0;
            return (
              <motion.div key={f.title} style={{ x: isEven ? xLeft : xRight }}>
                <FadeUp delay={i * 0.08}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={`group relative rounded-3xl overflow-hidden border border-[var(--line)] hover:border-chrono-accent/30 transition-all duration-500 ${isEven ? "md:flex-row" : "md:flex-row-reverse"} flex flex-col md:flex`}
                  >
                    {/* Photo side */}
                    <div className="relative w-full md:w-2/5 h-48 md:h-auto min-h-[240px] overflow-hidden">
                      <Image src={f.photo} alt={f.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="40vw" unoptimized />
                      <div className="absolute inset-0 bg-black/15" />
                    </div>
                    {/* Content side */}
                    <div className={`flex-1 p-8 md:p-14 flex flex-col justify-center ${f.bg}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`w-2 h-2 rounded-full ${f.dot}`} />
                        <span className={`text-[11px] font-body font-bold tracking-[0.2em] uppercase ${f.accent}`}>0{i + 1}</span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-display text-chrono-text tracking-tight mb-4" style={{ fontWeight: 800 }}>{f.title}</h3>
                      <p className="text-base md:text-lg font-body leading-relaxed text-chrono-text/55 max-w-md">{f.desc}</p>
                    </div>
                  </motion.div>
                </FadeUp>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const steps = [
    { num: "01", title: "Add your memories", desc: "Import from Google Photos, connect your calendar, or add events manually.", color: "text-amber-400" },
    { num: "02", title: "Watch your story unfold", desc: "See your life organized with maps, chapters, and interactive insights.", color: "text-violet-400" },
    { num: "03", title: "Discover your narrative", desc: "Personal narratives crafted from your life chapters — your story, told right.", color: "text-emerald-400" },
  ];
  return (
    <section ref={ref} className="relative py-24 md:py-44 px-6 overflow-hidden bg-[#111] text-white">
      {/* Floating colored orbs */}
      <motion.div animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-[10%] right-[15%] w-48 h-48 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
      <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 9, repeat: Infinity }} className="absolute bottom-[15%] left-[10%] w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <FadeUp>
            <h2 className="text-4xl md:text-6xl font-display tracking-tight text-white mb-14" style={{ fontWeight: 700 }}>How it <em className="text-white/60">works</em></h2>
          </FadeUp>
          {steps.map((s, i) => (
            <SlideIn key={s.num} delay={i * 0.15} from="left">
              <div className="flex gap-6 mb-12 group">
                <span className={`text-5xl md:text-6xl font-display ${s.color} opacity-30 leading-none shrink-0`} style={{ fontWeight: 800 }}>{s.num}</span>
                <div className="pt-1">
                  <h3 className="text-xl md:text-2xl font-display text-white mb-2" style={{ fontWeight: 600 }}>{s.title}</h3>
                  <p className="text-sm md:text-base font-body text-white/45 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </SlideIn>
          ))}
        </div>
        <motion.div style={{ y: imgY }} className="relative hidden md:block">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
              <Image src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80" alt="College memory" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl mt-12">
              <Image src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80" alt="Team celebration" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PhotoStripSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-10%", "5%"]);

  const row1 = [
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80",
    "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=600&q=80",
    "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
    "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=600&q=80",
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&q=80",
  ];
  const row2 = [
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600&q=80",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80",
    "https://images.unsplash.com/photo-1546156929-a4c0ac411f47?w=600&q=80",
  ];

  return (
    <section ref={ref} className="relative py-8 md:py-12 overflow-hidden space-y-4">
      <motion.div style={{ x: x1 }} className="flex gap-4 px-4">
        {row1.map((src, i) => (
          <motion.div key={i} whileHover={{ scale: 1.05 }} className="relative w-[260px] md:w-[340px] aspect-[16/10] rounded-xl overflow-hidden shrink-0 shadow-lg">
            <Image src={src} alt={`Memory ${i + 1}`} fill className="object-cover" sizes="340px" unoptimized />
          </motion.div>
        ))}
      </motion.div>
      <motion.div style={{ x: x2 }} className="flex gap-4 px-4">
        {row2.map((src, i) => (
          <motion.div key={i} whileHover={{ scale: 1.05 }} className="relative w-[260px] md:w-[340px] aspect-[16/10] rounded-xl overflow-hidden shrink-0 shadow-lg">
            <Image src={src} alt={`Memory ${i + 7}`} fill className="object-cover" sizes="340px" unoptimized />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="relative py-24 md:py-36 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--line)] rounded-3xl overflow-hidden">
          {[
            { value: 10, suffix: "k+", label: "Memories", color: "text-emerald-600 dark:text-emerald-400" },
            { value: 50, suffix: "+", label: "Cities", color: "text-amber-600 dark:text-amber-400" },
            { value: 365, suffix: "", label: "Days", color: "text-violet-600 dark:text-violet-400" },
            { value: 100, suffix: "%", label: "Private", color: "text-rose-600 dark:text-rose-400" },
          ].map((stat, i) => (
            <ScaleIn key={stat.label} delay={i * 0.1}>
              <motion.div whileHover={{ scale: 1.05, y: -4 }} className="text-center p-8 md:p-12 bg-[var(--card-bg)] cursor-default">
                <div className={`text-4xl md:text-6xl font-display ${stat.color} mb-2`} style={{ fontWeight: 800 }}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[11px] font-body font-bold text-chrono-text/35 uppercase tracking-[0.2em]">{stat.label}</div>
              </motion.div>
            </ScaleIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function MadeForYouSection() {
  const pills = [
    { text: "Travelers", border: "border-amber-400/40", hover: "hover:bg-amber-400/20", text_color: "text-amber-300" },
    { text: "Students", border: "border-violet-400/40", hover: "hover:bg-violet-400/20", text_color: "text-violet-300" },
    { text: "Professionals", border: "border-blue-400/40", hover: "hover:bg-blue-400/20", text_color: "text-blue-300" },
    { text: "Creatives", border: "border-rose-400/40", hover: "hover:bg-rose-400/20", text_color: "text-rose-300" },
    { text: "Parents", border: "border-emerald-400/40", hover: "hover:bg-emerald-400/20", text_color: "text-emerald-300" },
    { text: "Athletes", border: "border-orange-400/40", hover: "hover:bg-orange-400/20", text_color: "text-orange-300" },
    { text: "Journalers", border: "border-teal-400/40", hover: "hover:bg-teal-400/20", text_color: "text-teal-300" },
    { text: "Everyone", border: "border-white/40", hover: "hover:bg-white/20", text_color: "text-white" },
  ];
  return (
    <section className="relative py-20 md:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <ScaleIn>
          <div className="relative bg-[#111] rounded-[2rem] p-10 md:p-16 overflow-hidden">
            <motion.div animate={{ x: [0, 20, 0], y: [0, -10, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
            <motion.div animate={{ x: [0, -15, 0], y: [0, 15, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            <h2 className="relative text-4xl md:text-6xl font-display tracking-tight text-white mb-8" style={{ fontWeight: 700 }}>
              Crohna is made<br /><em className="text-white/50">for you</em>
            </h2>
            <div className="relative flex flex-wrap gap-2.5">
              {pills.map((pill, i) => (
                <motion.span
                  key={pill.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.1 }}
                  className={`px-5 py-2.5 rounded-full border ${pill.border} ${pill.hover} ${pill.text_color} text-sm font-body font-medium cursor-default transition-all duration-300`}
                >
                  {pill.text}
                </motion.span>
              ))}
            </div>
          </div>
        </ScaleIn>
      </div>
    </section>
  );
}

function QuoteSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-3, 3]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
    <section ref={ref} className="relative py-20 md:py-36 px-6 overflow-hidden bg-gradient-to-br from-violet-50 via-rose-50 to-amber-50 dark:from-violet-950/30 dark:via-rose-950/20 dark:to-amber-950/30">
      <motion.div style={{ rotate, scale }} className="max-w-4xl mx-auto text-center">
        <FadeUp>
          <p className="text-3xl md:text-5xl font-display tracking-tight text-chrono-text leading-tight" style={{ fontWeight: 500 }}>
            &ldquo;The best way to predict the future is to <em className="text-violet-600 dark:text-violet-400">remember</em> where you&rsquo;ve been.&rdquo;
          </p>
          <div className="flex items-center justify-center gap-3 mt-10">
            <div className="w-8 h-px bg-gradient-to-r from-violet-400 to-rose-400" />
            <span className="text-sm font-body font-medium text-chrono-text/40">Your story matters</span>
            <div className="w-8 h-px bg-gradient-to-r from-rose-400 to-amber-400" />
          </div>
        </FadeUp>
      </motion.div>
    </section>
  );
}

function CTASection() {
  const { data: session, status } = useSession();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.95, 1]);

  const handleCTA = () => {
    if (status !== "loading" && session) window.location.href = "/timeline";
    else signIn("google", { callbackUrl: "/timeline" });
  };

  return (
    <section ref={ref} className="relative py-28 md:py-52 px-6 overflow-hidden bg-[#111] text-white">
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-500/20 via-rose-500/10 to-amber-500/20 blur-3xl pointer-events-none" />
      <motion.div style={{ scale }} className="relative max-w-3xl mx-auto text-center">
        <FadeUp>
          <h2 className="font-display tracking-tight mb-8 text-white" style={{ fontSize: "clamp(2.8rem, 8vw, 6.5rem)", lineHeight: 1.05, fontWeight: 700 }}>
            Ready to map<br /><em className="text-white/50">your story?</em>
          </h2>
          <p className="text-lg font-body max-w-md mx-auto mb-14 leading-relaxed text-white/45">Transform your memories into a beautiful, interactive timeline.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={handleCTA} className="group inline-flex cursor-pointer items-center gap-2.5 rounded-full px-10 py-4 text-base font-body font-bold bg-white text-black hover:bg-white/90 shadow-[0_4px_30px_rgba(255,255,255,0.15)] transition-colors">
              Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
            <Link href="/insights" className="px-10 py-4 text-white/60 hover:text-white border border-white/15 hover:border-white/30 rounded-full transition-all text-sm font-body font-medium">See a Demo</Link>
          </div>
          <p className="mt-14 text-xs font-body font-medium text-white/25 tracking-wide">Free to start &middot; No credit card &middot; Your data stays private</p>
        </FadeUp>
      </motion.div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <HeroSection />
      <PhotoParallaxSection />
      <ColorMarquee />
      <FeaturesSection />
      <HowItWorksSection />
      <PhotoStripSection />
      <StatsSection />
      <QuoteSection />
      <MadeForYouSection />
      <CTASection />
    </>
  );
}
