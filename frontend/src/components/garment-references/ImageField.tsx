import { fileToThumbnailDataUrl } from '../../lib/image';

export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {value ? (
        <div className="space-y-2">
          <img src={value} alt={label} className="h-24 w-24 object-cover rounded border" />
          <button
            type="button"
            className="text-xs text-red-600 hover:underline"
            onClick={() => onChange('')}
          >
            Quitar
          </button>
        </div>
      ) : null}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="w-full text-sm mt-1"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            onChange(await fileToThumbnailDataUrl(file, 320));
          } catch (err) {
            alert(err instanceof Error ? err.message : 'Error al cargar imagen');
          }
          e.target.value = '';
        }}
      />
    </div>
  );
}
