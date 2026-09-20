import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/** ESLint flat config (eslint-config-next 16 isporucuje flat konfiguracije). */
const config = [
  ...coreWebVitals,
  ...typescript,
  { ignores: ['.next/**', 'out/**', '.wrangler/**', 'node_modules/**', 'next-env.d.ts'] },
];

export default config;
