'use client';

import { createContext, useContext, useCallback, useSyncExternalStore, ReactNode } from 'react';

const SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed';

interface SidebarContextType {
  isCollapsed: boolean;
  isLoaded: boolean;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  isLoaded: false,
  toggleCollapsed: () => {},
});

const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

const getSnapshot = () => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
const getServerSnapshot = () => false;

export function SidebarProvider({ children }: { children: ReactNode }) {
  const isCollapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isLoaded = useSyncExternalStore(subscribe, () => true, () => false);

  const toggleCollapsed = useCallback(() => {
    const newValue = !getSnapshot();
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
    // Dispatch storage event to trigger re-render
    window.dispatchEvent(new Event('storage'));
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, isLoaded, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
