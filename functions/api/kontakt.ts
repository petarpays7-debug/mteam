/**
 * Cloudflare Pages Function — zaprimanje kontaktnog obrasca.
 *
 * Stranica se gradi kao statički export, pa ovo jedino dinamično mjesto ne
 * živi u Next.js aplikaciji nego kao Pages Function (Workers runtime).
 * Ruta je i dalje `/api/kontakt`, tako da klijentski kod ostaje nepromijenjen.
 *
 * Validacijska shema dijeli se s formom (`src/lib/contact-schema.ts`), pa
 * klijent i poslužitelj ne mogu razići u pravilima.
 *
 * Bez postavljenih environment varijabli funkcija NAMJERNO ne glumi uspješno
 * slanje — vraća 503, a sučelje korisniku ponudi telefon i e-mail.
 */

import { contactSchema } from '../../src/lib/contact-schema';
import type { ContactFieldErrors, ContactResponse } from '../../src/lib/contact-schema';

type Env = {
  RESEND_API_KEY?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_TO_EMAIL?: string;
};

type RequestContext = {
  request: Request;
  env: Env;
};

/* -------------------------------------------------------------------------- */
/* Ogranicenje broja zahtjeva po IP adresi.                                    */
/* Drzi se u memoriji izolata, pa vrijedi samo unutar jednog izolata - dovoljno */
/* za usporavanje automatiziranih slanja. Za strogu kontrolu koristiti KV ili   */
/* Durable Object.                                                              */
/* -------------------------------------------------------------------------- */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 500) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }

  return recent.length > MAX_PER_WINDOW;
}

function json(body: ContactResponse, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/* -------------------------------------------------------------------------- */

type MailConfig = { apiKey: string; from: string; to: string };

function readMailConfig(env: Env): MailConfig | null {
  const apiKey = env.RESEND_API_KEY;
  const from = env.CONTACT_FROM_EMAIL;
  const to = env.CONTACT_TO_EMAIL;

  if (!apiKey || !from || !to) return null;
  return { apiKey, from, to };
}

async function sendViaResend(
  config: MailConfig,
  data: { name: string; email: string; message: string },
): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.from,
      to: [config.to],
      reply_to: data.email,
      subject: `Upit s web stranice — ${data.name}`,
      text: [
        `Ime i prezime: ${data.name}`,
        `E-mail: ${data.email}`,
        '',
        'Poruka:',
        data.message,
      ].join('\n'),
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend odgovorio statusom ${response.status}`);
  }
}

/* -------------------------------------------------------------------------- */

async function handlePost(context: RequestContext): Promise<Response> {
  const { request, env } = context;

  const ip =
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';

  if (rateLimited(ip)) {
    return json(
      {
        ok: false,
        code: 'rate_limited',
        message: 'Zaprimili smo previše upita s ove adrese. Pokušajte ponovno za nekoliko minuta.',
      },
      429,
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    payload = null;
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: ContactFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === 'string' && !(field in fieldErrors)) {
        fieldErrors[field as keyof ContactFieldErrors] = issue.message;
      }
    }
    return json({ ok: false, code: 'validation', fieldErrors }, 400);
  }

  // Skriveno polje popunjeno - tihi prekid, bez povratne informacije posiljatelju.
  if (parsed.data.company) {
    return json({ ok: true }, 200);
  }

  const config = readMailConfig(env);
  if (!config) {
    return json(
      {
        ok: false,
        code: 'not_configured',
        message:
          'Slanje poruke putem obrasca trenutačno nije aktivirano. Javite nam se telefonom ili e-mailom.',
      },
      503,
    );
  }

  try {
    await sendViaResend(config, parsed.data);
    return json({ ok: true }, 200);
  } catch (error) {
    console.error('[kontakt] slanje nije uspjelo:', error);
    return json(
      {
        ok: false,
        code: 'send_failed',
        message:
          'Poruku trenutačno nije moguće poslati. Pokušajte ponovno ili nas kontaktirajte telefonom.',
      },
      502,
    );
  }
}

/**
 * Jedinstvena ulazna tocka - izbjegava dvojbu oko prioriteta izmedju
 * `onRequest` i `onRequest<Metoda>` izvoza.
 */
export function onRequest(context: RequestContext): Promise<Response> | Response {
  if (context.request.method === 'POST') return handlePost(context);
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
}
