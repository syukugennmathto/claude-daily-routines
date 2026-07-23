"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Status = "idle" | "sending" | "done";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({ name: "", email: "", topic: "お仕事のご相談", message: "" });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Front-end demo only — wire this to your form endpoint of choice.
    setStatus("sending");
    setTimeout(() => setStatus("done"), 900);
  };

  const field =
    "w-full border-b border-light-gray bg-transparent py-3 text-ink placeholder:text-dusty-brown/60 focus:border-gold focus:outline-none transition-colors";

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {status === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-light-gray bg-warm-white p-10 text-center"
          >
            <p className="font-display text-2xl text-ink">ありがとうございます</p>
            <p className="mt-3 text-sm leading-loose text-ink-soft">
              メッセージを受け取りました。数日のうちに、お返事いたしますね。
            </p>
            <button
              type="button"
              onClick={() => { setStatus("idle"); setForm({ name: "", email: "", topic: "お仕事のご相談", message: "" }); }}
              className="link-underline mt-6 text-sm text-dusty-brown"
            >
              もう一度書く
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="grid gap-8 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs tracking-widest text-dusty-brown">お名前</span>
                <input required value={form.name} onChange={update("name")} className={field} placeholder="山田 花子" />
              </label>
              <label className="block">
                <span className="text-xs tracking-widest text-dusty-brown">メールアドレス</span>
                <input required type="email" value={form.email} onChange={update("email")} className={field} placeholder="you@example.com" />
              </label>
            </div>
            <label className="block">
              <span className="text-xs tracking-widest text-dusty-brown">ご用件</span>
              <select value={form.topic} onChange={update("topic")} className={field}>
                <option>お仕事のご相談</option>
                <option>ぬいぐるみ・グッズについて</option>
                <option>ZINE・展示について</option>
                <option>取材・掲載のご依頼</option>
                <option>その他</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs tracking-widest text-dusty-brown">メッセージ</span>
              <textarea required value={form.message} onChange={update("message")} rows={5} className={`${field} resize-none`} placeholder="ご自由にお書きください。" />
            </label>
            <button
              type="submit"
              disabled={status === "sending"}
              className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-sm tracking-widest text-ivory transition-colors hover:bg-dusty-brown-deep disabled:opacity-60"
            >
              {status === "sending" ? "送信しています…" : "メッセージを送る"}
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
            <p className="text-xs leading-relaxed text-dusty-brown/80">
              ※ こちらはデモ用のフォームです。実際の送信先は設置時に接続してください。
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
