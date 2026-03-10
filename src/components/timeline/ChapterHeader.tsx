"use client";

import { motion } from "framer-motion";

interface ChapterHeaderProps {
  title: string;
  subtitle?: string;
  dateRange?: string;
}

export default function ChapterHeader({ title, subtitle, dateRange }: ChapterHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative py-16 flex justify-center"
    >
      <div className="relative text-center">
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-px h-6 bg-gradient-to-b from-transparent to-chrono-accent/15" />

        <div className="inline-flex flex-col items-center gap-3 px-10 py-5 bg-chrono-card/20 border border-chrono-accent/12">
          <span className="section-label">
            Chapter
          </span>
          <h3 className="text-lg md:text-xl font-display font-light gradient-text">{title}</h3>
          {subtitle && (
            <p className="text-xs font-body font-light text-chrono-text-secondary">{subtitle}</p>
          )}
          {dateRange && (
            <span className="text-[10px] font-body font-light text-chrono-muted uppercase tracking-wider">{dateRange}</span>
          )}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 w-px h-6 bg-gradient-to-b from-chrono-accent/15 to-transparent" />
      </div>
    </motion.div>
  );
}
