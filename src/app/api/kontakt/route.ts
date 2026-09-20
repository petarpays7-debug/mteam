import { NextResponse } from 'next/server';
import { company } from '@/content/company';
import { contactSchema } from '@/lib/contact-schema';
import type { ContactFieldErrors, ContactResponse } from '@/lib/contact-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* -------------------------------------------------------------------------- */
/* Jednostavno ogranicenje broja zahtjeva po IP adresi (in-memory).            */
/* Za vise instanci zamijeniti vanjskim spremistem (npr. Redis, Upstash).      */
/* -------------------------------------------------------------------------- */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  // Povremeno ciscenje kako mapa ne bi rasla neograniceno.
  if (hits.size > 500) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }

  return recent.length > MAX_PER_WINDOW;
}

/* -------------------------------------------------------------------------- */

type MailConfig = { apiKey: string; from: string; to: string };

/**
 * Konfiguracija se cita iskljucivo iz environment varijabli.
 * Dok nisu postavljene, ruta namjerno NE glumi uspjesno slanje - vraca 503
 * i korisniku se u sucelju nude telefon i e-mail kao alternativa.
 */
function readMailConfig(): MailConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL ?? company.email.display;

  if (!apiKey || !from || !to) return null;
  return { apiKey, from, to };
}

async function sendViaResend(config: MailConfig, data: { name: string; email: string; message: string }) {
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

export async function POST(request: Request): Promise<NextResponse<ContactResponse>> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (rateLimited(ip)) {
    return NextResponse.json(
      {
        ok: false,
        code: 'rate_limited',
        message: 'Zaprimili smo previše upita s ove adrese. Pokušajte ponovno za nekoliko minuta.',
      },
      { status: 429 },
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
    return NextResponse.json({ ok: false, code: 'validation', fieldErrors }, { status: 400 });
  }

  // Skriveno polje popunjeno - tihi prekid, bez povratne informacije posiljatelju.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const config = readMailConfig();
  if (!config) {
    return NextResponse.json(
      {
        ok: false,
        code: 'not_configured',
        message:
          'Slanje poruke putem obrasca trenutačno nije aktivirano. Javite nam se telefonom ili e-mailom.',
      },
      { status: 503 },
    );
  }

  try {
    await sendViaResend(config, parsed.data);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('[kontakt] slanje nije uspjelo:', error);
    return NextResponse.json(
      {
        ok: false,
        code: 'send_failed',
        message:
          'Poruku trenutačno nije moguće poslati. Pokušajte ponovno ili nas kontaktirajte telefonom.',
      },
      { status: 502 },
    );
  }
}
