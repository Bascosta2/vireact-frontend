import type { ReactNode } from 'react';

interface HighlightProps {
  children: ReactNode;
}

export const Highlight = ({ children }: HighlightProps) => (
  <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">
    {children}
  </span>
);

