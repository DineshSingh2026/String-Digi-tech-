"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contact, interactive } from "@/content/copy";
import { contactSchema, type ContactInput } from "@/lib/contactSchema";
import css from "@/components/pages/widgets.module.css";

type Status = "idle" | "sending" | "success" | "error" | "rate";

const field =
  "block w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-[15px] text-text placeholder:text-muted transition-[border-color,box-shadow,background-color] duration-200 hover:border-white/20 focus:border-accent focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(244,78,4,0.16)] focus:outline-none aria-[invalid=true]:border-risk aria-[invalid=true]:shadow-[0_0_0_4px_rgba(229,72,77,0.12)]";
const labelCls = "mb-2 flex items-center gap-1 text-[13px] font-medium text-text/90";

function Req() {
  return (
    <span aria-hidden="true" className="text-accent">
      *
    </span>
  );
}

export default function ContactForm() {
  const f = contact.form;
  const [status, setStatus] = useState<Status>("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", company: "", email: "", country: "", interest: "", message: "", consent: false, website: "" },
  });

  const onSubmit = async (data: ContactInput) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("success");
        reset();
      } else setStatus(res.status === 429 ? "rate" : "error");
    } catch {
      setStatus("error");
    }
  };

  const err = (name: keyof ContactInput) => {
    const msg = errors[name]?.message;
    return msg ? (
      <p id={`${name}-error`} className="mt-2 flex items-center gap-1.5 text-[13px] text-risk">
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
          <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 4.5v4.5M8 11v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {msg}
      </p>
    ) : null;
  };
  const aria = (name: keyof ContactInput) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    "aria-required": true,
  });

  if (status === "success") {
    return (
      <div role="status" className="flex flex-col items-center px-4 py-14 text-center md:py-20">
        <svg viewBox="0 0 64 64" className={`h-20 w-20 text-signal ${css.check}`} aria-hidden="true">
          <circle cx="32" cy="32" r="25" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <path d="M21 33l7 7 15-16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="mt-8 max-w-[36ch] font-display text-[clamp(22px,2.2vw,28px)] leading-[1.25] tracking-[-0.02em] text-text">
          {f.success}
        </p>
      </div>
    );
  }

  const text = (name: "name" | "company" | "email" | "country", label: string, auto: string, type = "text") => (
    <div>
      <label htmlFor={name} className={labelCls}>
        {label}
        <Req />
      </label>
      <input id={name} type={type} autoComplete={auto} className={`${field} h-12`} {...register(name)} {...aria(name)} />
      {err(name)}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        {text("name", f.name, "name")}
        {text("company", f.company, "organization")}
        {text("email", f.email, "email", "email")}
        {text("country", f.country, "country-name")}
      </div>
      <div>
        <label htmlFor="interest" className={labelCls}>
          {f.interest}
          <Req />
        </label>
        <div className="relative">
          <select id="interest" className={`${field} h-12 cursor-pointer appearance-none pr-11`} {...register("interest")} {...aria("interest")}>
            <option value="" className="bg-surface">
              {interactive.contactForm.select}
            </option>
            {f.interestOptions.map((o) => (
              <option key={o} value={o} className="bg-surface">
                {o}
              </option>
            ))}
          </select>
          <svg viewBox="0 0 16 16" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true">
            <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {err("interest")}
      </div>
      <div>
        <label htmlFor="message" className={labelCls}>
          {f.message}
          <Req />
        </label>
        <textarea id="message" rows={6} className={`${field} resize-y py-3 leading-relaxed`} {...register("message")} {...aria("message")} />
        {err("message")}
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">{interactive.contactForm.honeypot}</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <div>
        <div className="flex items-start gap-3">
          <span className="relative mt-0.5 grid h-5 w-5 shrink-0 place-items-center">
            <input
              id="consent"
              type="checkbox"
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-[5px] border border-white/25 bg-white/[0.03] transition-colors checked:border-accent checked:bg-accent hover:border-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-[invalid=true]:border-risk"
              {...register("consent")}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? "consent-error" : undefined}
            />
            <svg
              viewBox="0 0 16 16"
              className="pointer-events-none absolute h-3.5 w-3.5 text-black opacity-0 transition-opacity peer-checked:opacity-100"
              aria-hidden="true"
            >
              <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <label htmlFor="consent" className="cursor-pointer text-[14px] leading-relaxed text-muted">
            {f.consent}
          </label>
        </div>
        {err("consent")}
      </div>
      {status === "error" || status === "rate" ? (
        <p role="alert" className="rounded-lg border border-risk/40 bg-risk/[0.06] p-4 text-[14px] text-risk">
          {status === "rate" ? f.rateLimited : f.error}
        </p>
      ) : null}
      <div className="flex flex-col gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "sending"}
          className="group inline-flex h-12 min-w-[200px] items-center justify-center gap-3 rounded-lg bg-accent px-6 font-semibold text-black shadow-[0_10px_30px_-10px_rgba(244,78,4,0.7)] transition-[background-color,box-shadow,opacity] duration-200 hover:bg-[#ff6a26] hover:shadow-[0_14px_40px_-10px_rgba(244,78,4,0.85)] disabled:cursor-wait disabled:opacity-70"
        >
          {status === "sending" ? (
            <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
          ) : null}
          {status === "sending" ? f.sending : f.submit}
          {status !== "sending" ? (
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          ) : null}
        </button>
      </div>
    </form>
  );
}
