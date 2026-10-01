import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm sm:hidden">
      <div className="w-full bg-white dark:bg-gray-850 rounded-t-2xl shadow-2xl border-t border-gray-200 dark:border-gray-700 max-h-[85vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700/60">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 pt-1">{title}</h3>
          <IconButton
            icon={<X className="w-5 h-5" />}
            label="Close sheet"
            onClick={onClose}
            size="sm"
          />
        </div>
        <div className="p-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
