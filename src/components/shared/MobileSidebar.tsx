import React, { useEffect } from 'react';
import clsx from 'clsx';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/40 z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full w-[80%] max-w-sm bg-white z-50 shadow-lg transition-transform duration-300 overflow-y-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ willChange: 'transform' }}
      >
        {children}
      </aside>
    </>
  );
};
