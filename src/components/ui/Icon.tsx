import type { SVGProps } from 'react';
import type { IconName } from '@/content/services';

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName | ExtraIconName;
  title?: string;
};

export type ExtraIconName =
  | 'arrow-right'
  | 'arrow-up-right'
  | 'phone'
  | 'mail'
  | 'pin'
  | 'check'
  | 'plus'
  | 'minus'
  | 'menu'
  | 'close'
  | 'chevron-down'
  | 'roof-pitched'
  | 'roof-metal'
  | 'roof-flat'
  | 'ground'
  | 'carport'
  | 'fence';

/**
 * Jedinstveni line-icon set (stroke 1.5, 24x24 grid).
 * U dizajnu se ne koriste emoji ikone.
 */
const paths: Record<string, React.ReactNode> = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
    </>
  ),
  blueprint: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M3 9h18M8 9v11M8 14h6M13 14v6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5.5c0 4.2-2.9 7.6-7 9.5-4.1-1.9-7-5.3-7-9.5V6l7-3z" />
      <path d="M9.2 12l2 2 3.6-3.8" />
    </>
  ),
  package: (
    <>
      <path d="M12 3l8 4.2v9.6L12 21l-8-4.2V7.2L12 3z" />
      <path d="M4 7.2l8 4.2 8-4.2M12 11.4V21" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.4 8.6l-1.9 4.9-4.9 1.9 1.9-4.9 4.9-1.9z" />
    </>
  ),
  document: (
    <>
      <path d="M14 3H7a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V7.5L14 3z" />
      <path d="M13.5 3v5h5M9 13h6M9 16.5h4" />
    </>
  ),
  bolt: <path d="M13.5 2.5L5.5 13h5l-.9 8.5L18.5 11h-5l.9-8.5z" />,
  car: (
    <>
      <path d="M4.5 16.5v2a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-2M22.5 16.5v2a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-2" />
      <path d="M2.5 16.5v-4l2-5A2 2 0 0 1 6.4 6h11.2a2 2 0 0 1 1.9 1.4l2 5v4a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1z" />
      <path d="M4 12h16M6.5 15.5h2M15.5 15.5h2" />
    </>
  ),
  frame: (
    <>
      <path d="M3 8.5l9-4 9 4-9 4-9-4z" />
      <path d="M6 10.8V19M18 10.8V19M6 19h12M12 12.5V19" />
    </>
  ),
  'arrow-right': <path d="M4 12h15m-5.5-5.5L19.5 12 13.5 17.5" />,
  'arrow-up-right': <path d="M7.5 16.5l9-9M9 7.5h7.5V15" />,
  phone: (
    <path d="M7.2 3.5h-2A2 2 0 0 0 3.3 5.8c.5 4 2.3 7.6 5 10.3 2.7 2.7 6.3 4.5 10.3 5a2 2 0 0 0 2.2-2v-2a1.6 1.6 0 0 0-1.4-1.6l-2.3-.3a1.6 1.6 0 0 0-1.5.7l-.8 1.2a13.5 13.5 0 0 1-5.6-5.6l1.2-.8a1.6 1.6 0 0 0 .7-1.5l-.3-2.3a1.6 1.6 0 0 0-1.6-1.4z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.8" />
      <path d="M3.8 6.5l8.2 6 8.2-6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  menu: <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  'chevron-down': <path d="M6 9.5l6 6 6-6" />,
  'roof-pitched': (
    <>
      <path d="M2.5 14.5L12 6l9.5 8.5" />
      <path d="M6.5 12.5l3 4M12 8.5l3 4M17 12.5l-1.5 2" />
      <path d="M4 18.5h16" />
    </>
  ),
  'roof-metal': (
    <>
      <path d="M3 16.5l4-9h10l4 9" />
      <path d="M8.5 7.5l-2.5 9M12 7.5v9M15.5 7.5l2.5 9" />
    </>
  ),
  'roof-flat': (
    <>
      <path d="M3 16.5h18" />
      <path d="M6.5 16.5l2-6h7l2 6" />
      <path d="M8.5 13.5h7" />
    </>
  ),
  ground: (
    <>
      <path d="M3.5 18.5h17" />
      <path d="M5 15L16 8.5M7.5 15v3.5M14 11v7.5" />
      <path d="M4.5 12.5l11-6.5" />
    </>
  ),
  carport: (
    <>
      <path d="M3 9.5l9-4 9 4" />
      <path d="M5 9.5v9M19 9.5v9" />
      <path d="M8 18.5v-2.5a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  fence: (
    <>
      <path d="M6 4.5v15M12 4.5v15M18 4.5v15" />
      <path d="M3 8.5h18M3 15.5h18" />
    </>
  ),
};

export function Icon({ name, title, ...props }: IconProps) {
  const content = paths[name] ?? paths.bolt;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {content}
    </svg>
  );
}
