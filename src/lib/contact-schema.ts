import { z } from 'zod';

/** Dijeljena shema - koristi je i klijentska forma i posluziteljska ruta. */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Unesite ime i prezime (najmanje 2 znaka).')
    .max(120, 'Ime i prezime može imati najviše 120 znakova.'),
  email: z
    .string()
    .trim()
    .min(1, 'Unesite e-mail adresu.')
    .email('Unesite ispravnu e-mail adresu.')
    .max(200, 'E-mail adresa je predugačka.'),
  message: z
    .string()
    .trim()
    .min(10, 'Poruka mora imati najmanje 10 znakova.')
    .max(4000, 'Poruka može imati najviše 4000 znakova.'),
  /** Skriveno polje - popunjavaju ga samo automatizirani slanja. */
  company: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactFieldErrors = Partial<Record<keyof ContactInput, string>>;

export type ContactResponse =
  | { ok: true }
  | { ok: false; code: 'validation'; fieldErrors: ContactFieldErrors }
  | { ok: false; code: 'not_configured' | 'send_failed' | 'rate_limited'; message: string };
