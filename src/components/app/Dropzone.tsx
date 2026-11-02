import { forwardRef, useId, useImperativeHandle, useRef, useState, type DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VIDEO_ACCEPT, VIDEO_RULES_HINT } from '@/lib/video-file';

export type DropzoneHandle = { open: () => void; focus: () => void };

type DropzoneProps = {
  onFile: (file: File) => void;
  error?: string | null;
  disabled?: boolean;
  label?: string;
  className?: string;
};

/** File picker that is a real button (Enter/Space open the dialog) and also accepts a dropped file. */
export const Dropzone = forwardRef<DropzoneHandle, DropzoneProps>(function Dropzone(
  { onFile, error, disabled = false, label = 'Drop a video here or choose a file', className },
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const hintId = useId();
  const errorId = useId();

  useImperativeHandle(ref, () => ({
    open: () => inputRef.current?.click(),
    focus: () => buttonRef.current?.focus(),
  }));

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div className={className}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-describedby={error ? `${errorId} ${hintId}` : hintId}
        aria-invalid={error ? true : undefined}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'app-focus flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center',
          'transition-[background-color,border-color,box-shadow] duration-200 ease-app-out disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-danger bg-danger/5' : 'border-control bg-surface hover:bg-surface-raised',
          dragOver && 'border-accent bg-accent-tint shadow-[0_0_0_4px_var(--app-accent-tint)]'
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-tint text-accent">
          <UploadCloud className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="text-base font-medium text-fg">{label}</span>
        <span id={hintId} className="text-sm text-fg-muted">
          {VIDEO_RULES_HINT}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={VIDEO_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
