import { cn } from '@/lib/cn';
import type { Photo as PhotoData } from '@/content/photos';

type PhotoProps = {
  photo: PhotoData;
  className?: string;
  /** Omjer okvira; slika se unutar njega kadrira. */
  ratio?: string;
  /** `sizes` za odabir inačice — utječe na to koju širinu preglednik povuče. */
  sizes?: string;
  /** Hero slike se učitavaju odmah; sve ostalo lijeno. */
  priority?: boolean;
  /** Tamni preljev preko slike, da tekst nad njom ostane čitljiv. */
  overlay?: boolean;
};

/**
 * Obični `<img>` s `srcset`.
 *
 * Uz `output: 'export'` nema Next.js optimizacije slika u runtimeu, pa su
 * inačice pripremljene unaprijed (vidi `src/content/photos.ts`). Širina i
 * visina su uvijek navedene kako slika ne bi pomicala raspored (CLS).
 */
export function Photo({
  photo,
  className,
  ratio = '4 / 3',
  sizes = '(min-width: 1024px) 50vw, 100vw',
  priority = false,
  overlay = false,
}: PhotoProps) {
  return (
    <figure
      className={cn('relative overflow-hidden rounded-card border border-white/10', className)}
      style={{ aspectRatio: ratio }}
    >
      {/*
        eslint-disable-next-line @next/next/no-img-element --
        Projekt se gradi kao staticki export, pa `next/image` nema posluzitelj
        za optimizaciju. Inacice su pripremljene unaprijed i biraju se preko
        `srcset`/`sizes`, uz zadane dimenzije protiv pomicanja rasporeda.
      */}
      <img
        src={photo.src}
        srcSet={`${photo.small} 900w, ${photo.src} 1800w`}
        sizes={sizes}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {overlay ? (
        <span
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(4,18,27,0.86)_0%,rgba(4,18,27,0.35)_45%,rgba(4,18,27,0.12)_100%)]"
        />
      ) : null}
    </figure>
  );
}
