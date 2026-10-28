"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contact, interactive } from "@/content/copy";
import { contactSchema, type ContactInput } from "@/lib/contactSchema";

type Status = "idle" | "sending" | "success" | "error" | "rate";

const field =
  "block w-full rounded-lg border border-line bg-white px-4 text-[15px] text-text placeholder:text-muted transition-[border-color,box-shadow] duration-200 hover:border-[#cfd6de] focus:border-accent focus:shadow-[0_0_0_4px_rgba(194,65,12,0.14)] focus:outline-none aria-[invalid=true]:border-[#b42318] aria-[invalid=true]:shadow-[0_0_0_4px_rgba(180,35,24,0.08)]";
const labelCls = "mb-2 flex items-center gap-1 text-[14px] font-medium text-text";

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
      <p id={`${name}-error`} className="mt-2 flex items-center gap-1.5 text-[13px] text-[#b42318]">
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
        <span className="grid h-16 w-16 place-items-center rounded-full bg-accent-soft text-accent">
          <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="mt-7 max-w-[36ch] font-display text-[clamp(20px,2vw,24px)] font-semibold leading-[1.35] tracking-[-0.015em] text-text">
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative flex flex-col gap-6">
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
            <option value="">{interactive.contactForm.select}</option>
            {f.interestOptions.map((o) => (
              <option key={o} value={o}>
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
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-[5px] border border-[#c5cdd6] bg-white transition-colors checked:border-accent checked:bg-accent hover:border-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-[invalid=true]:border-[#b42318]"
              {...register("consent")}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? "consent-error" : undefined}
            />
            <svg
              viewBox="0 0 16 16"
              className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
              aria-hidden="true"
            >
              <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <label htmlFor="consent" className="cursor-pointer text-[14px] leading-relaxed text-body">
            {f.consent}
          </label>
        </div>
        {err("consent")}
      </div>
      {status === "error" || status === "rate" ? (
        <p role="alert" className="rounded-lg border border-[#f3c9c4] bg-[#fdf3f2] p-4 text-[14px] text-[#b42318]">
          {status === "rate" ? f.rateLimited : f.error}
        </p>
      ) : null}
      <div className="border-t border-line pt-6">
        <button
          type="submit"
          disabled={status === "sending"}
          className="group inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-accent px-7 text-[15px] font-semibold text-white transition-[background-color,opacity] duration-200 hover:bg-accent-hover disabled:cursor-wait disabled:opacity-75 sm:w-auto sm:min-w-[200px]"
        >
          {status === "sending" ? (
            <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : null}
          {status === "sending" ? f.sending : f.submit}
          {status !== "sending" ? (
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          ) : null}
        </button>
      </div>
    </form>
  );
}
