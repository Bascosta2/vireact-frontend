import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const COLLAPSED_KEY = 'vireact_sidebar_collapsed';

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
};

/** The rail remembers being collapsed (icons only) between visits. */
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setCollapsedState] = useState(readCollapsed);
  const setIsCollapsed = (collapsed: boolean) => {
    setCollapsedState(collapsed);
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0');
    } catch {
      // private window: remember for this visit only
    }
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
