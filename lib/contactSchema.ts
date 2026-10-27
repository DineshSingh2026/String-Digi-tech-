import { z } from "zod";
import { contact } from "@/content/copy";

const e = contact.form.errors;
const interests = contact.form.interestOptions;

const required = (max: number) => z.string().trim().min(1, e.required).max(max);

export const contactSchema = z.object({
  name: required(120),
  company: required(160),
  email: z.string().trim().min(1, e.required).pipe(z.email(e.email)),
  country: required(80),
  interest: z.string().refine((v) => (interests as readonly string[]).includes(v), e.required),
  message: required(4000),
  consent: z.boolean().refine((v) => v === true, e.consent),
  /** Honeypot: must stay empty. Accepted by the schema so the API can drop bots silently. */
  website: z.string().max(500).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
