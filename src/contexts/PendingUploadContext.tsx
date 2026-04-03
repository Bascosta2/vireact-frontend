import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type PendingVideoMetadata = {
  duration: number;
  size: number;
  format: string;
  previewUrl: string;
};

export type PendingUploadState = {
  mode: 'file' | 'url';
  file: File | null;
  url: string;
  displayName: string;
  videoMetadata: PendingVideoMetadata | null;
};

type PendingUploadContextValue = {
  pending: PendingUploadState | null;
  setPending: (value: PendingUploadState | null) => void;
  clearPending: () => void;
};

const PendingUploadContext = createContext<PendingUploadContextValue | undefined>(undefined);

export function PendingUploadProvider({ children }: { children: ReactNode }) {
  const [pending, setPendingState] = useState<PendingUploadState | null>(null);

  const setPending = useCallback((value: PendingUploadState | null) => {
    setPendingState(value);
  }, []);

  const clearPending = useCallback(() => {
    setPendingState(null);
  }, []);

  const value = useMemo(
    () => ({ pending, setPending, clearPending }),
    [pending, setPending, clearPending]
  );

  return <PendingUploadContext.Provider value={value}>{children}</PendingUploadContext.Provider>;
}

export function usePendingUpload() {
  const ctx = useContext(PendingUploadContext);
  if (!ctx) {
    throw new Error('usePendingUpload must be used within PendingUploadProvider');
  }
  return ctx;
}
