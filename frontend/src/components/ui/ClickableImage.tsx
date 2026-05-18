import { useState } from 'react';
import { ImageLightbox } from './ImageLightbox';

interface Props {
  src: string;
  alt?: string;
  label?: string;
  className?: string;
}

export function ClickableImage({ src, alt, label, className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`block cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded ${className ?? ''}`}
        title="Ver pantalla completa"
      >
        <img src={src} alt={alt ?? ''} className={className} />
      </button>
      {open && (
        <ImageLightbox src={src} alt={alt} label={label} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
