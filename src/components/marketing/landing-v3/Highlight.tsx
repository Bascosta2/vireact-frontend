import type { ReactNode } from 'react';

interface HighlightProps {
  children: ReactNode;
}

export const Highlight = ({ children }: HighlightProps) => (
  <span className="text-[#ff6f61]">
    {children}
  </span>
);

