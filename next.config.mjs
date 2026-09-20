/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  /*
    Statički export u `out/`.

    Sve stranice su prerenderirane, pa se posluzuju izravno s Cloudflare CDN-a.
    Jedini dinamicni dio - slanje kontakt obrasca - izveden je kao Cloudflare
    Pages Function u `functions/api/kontakt.ts`.

    Ako aplikacija kasnije zatreba pravi SSR (npr. dinamicne stranice ili
    middleware), ovaj `output` se uklanja i projekt se deploya preko OpenNext
    adaptera na Cloudflare Workers.
  */
  output: 'export',

  images: {
    // Bez Next.js posluzitelja nema optimizacije slika u runtimeu.
    // Slike se optimiziraju unaprijed i stavljaju u /public kao WebP/AVIF.
    unoptimized: true,
  },

  /*
    HTTP zaglavlja se NE definiraju ovdje - `output: 'export'` ih ignorira jer
    nema posluzitelja. Definirana su u `public/_headers`, sto Cloudflare Pages
    cita nativno.
  */
};

export default nextConfig;
