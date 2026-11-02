import { useId } from 'react';
import { Button } from '@/components/app/Button';

type FileRowProps = {
  previewUrl: string;
  title: string;
  onTitleChange: (value: string) => void;
  details: string;
  onReplace: () => void;
  onRemove: () => void;
};

export function FileRow({ previewUrl, title, onTitleChange, details, onReplace, onRemove }: FileRowProps) {
  const inputId = useId();
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center">
      <video
        src={`${previewUrl}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="h-28 w-16 shrink-0 self-center rounded-lg bg-black object-cover sm:self-auto"
      />
      <div className="min-w-0 flex-1">
        <label htmlFor={inputId} className="text-sm font-medium text-fg-muted">
          Video name
        </label>
        <input
          id={inputId}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={120}
          className="app-focus mt-1 h-11 w-full rounded-lg border border-control bg-canvas px-3 text-base text-fg"
        />
        {details && <p className="tabular mt-2 text-sm text-fg-muted">{details}</p>}
      </div>
      <div className="flex gap-2 sm:flex-col">
        <Button variant="secondary" size="sm" onClick={onReplace}>
          Replace
        </Button>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </div>
  );
}
