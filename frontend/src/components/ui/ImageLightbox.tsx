import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  src: string;
  alt?: string;
  label?: string;
  onClose: () => void;
}

export function ImageLightbox({ src, alt, label, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="flex items-center justify-between text-white mb-2 shrink-0">
        <span className="text-sm font-medium">{label ?? alt ?? 'Imagen'}</span>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10"
          aria-label="Cerrar"
        >
          <X size={24} />
        </button>
      </div>
      <div
        className="flex-1 flex items-center justify-center min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt ?? ''}
          className="max-w-full max-h-full object-contain rounded"
        />
      </div>
  );
}
