"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  { value: "travel", label: "Travel" },
  { value: "achievement", label: "Achievement" },
  { value: "education", label: "Education" },
  { value: "life", label: "Life" },
  { value: "career", label: "Career" },
];

export default function AddMemoryButton() {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    location: "",
    category: "",
    description: "",
    imageUrl: "",
  });

  const resetForm = () => {
    setForm({ title: "", date: "", location: "", category: "", description: "", imageUrl: "" });
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.date) return;
    // In a real app, this would save to a database
    setOpen(false);
    resetForm();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    }
  }, []);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-5 py-3 bg-white text-black text-sm font-body font-medium rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
      >
        <span className="text-lg leading-none">+</span>
        Add Memory
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            />

            {/* Slide-up Modal */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] max-h-[90vh] bg-chrono-surface border-t border-white/[0.12] rounded-t-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
                <div>
                  <h2 className="text-xl font-display font-bold text-chrono-text">Add Memory</h2>
                  <p className="text-xs font-body font-extralight text-chrono-muted mt-1">
                    Capture a moment worth remembering
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-chrono-card flex items-center justify-center text-chrono-muted hover:text-chrono-text hover:bg-white/[0.06] transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Title */}
                <div>
                  <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="What happened?"
                    className="w-full bg-chrono-card/40 px-4 py-3 text-sm text-chrono-text placeholder:text-chrono-muted/50 border border-white/[0.08] transition-colors outline-none focus:border-white/30"
                  />
                </div>

                {/* Date & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full bg-chrono-card/40 px-4 py-3 text-sm text-chrono-text border border-white/[0.08] transition-colors outline-none focus:border-white/30 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">Location</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      placeholder="City, State"
                      className="w-full bg-chrono-card/40 px-4 py-3 text-sm text-chrono-text placeholder:text-chrono-muted/50 border border-white/[0.08] transition-colors outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">Category</label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full bg-chrono-card/40 px-4 py-3 text-sm text-chrono-text border border-white/[0.08] transition-colors outline-none focus:border-white/30 appearance-none [color-scheme:dark]"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-chrono-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Tell the story behind this moment..."
                    rows={3}
                    className="w-full bg-chrono-card/40 px-4 py-3 text-sm text-chrono-text placeholder:text-chrono-muted/50 border border-white/[0.08] transition-colors outline-none focus:border-white/30 resize-none"
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">Photo Upload</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative h-32 border-2 border-dashed transition-all cursor-pointer overflow-hidden rounded-lg ${
                      dragOver
                        ? "border-white/30 bg-white/[0.03]"
                        : form.imageUrl
                        ? "border-white/[0.08]"
                        : "border-white/[0.12] hover:border-white/20 bg-chrono-card/20"
                    }`}
                  >
                    {form.imageUrl ? (
                      <div className="relative w-full h-full group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-sm text-white">Change photo</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <svg className="w-8 h-8 text-chrono-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                        <p className="text-xs text-chrono-muted">Drag & drop or click to upload</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/[0.08]">
                <button
                  onClick={handleSave}
                  disabled={!form.title.trim() || !form.date}
                  className="w-full py-3 text-sm font-body font-medium bg-white text-black rounded-full hover:bg-white/90 transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save Memory
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
