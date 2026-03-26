import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface XPToastProps {
  xp: number;
  visible: boolean;
  onDismiss?: () => void;
}

/**
 * A floating XP award animation that pops up when the user earns XP.
 * Auto-dismisses after 2 seconds.
 */
export default function XPToast({ xp, visible, onDismiss }: XPToastProps) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => onDismiss?.(), 2000);
      return () => clearTimeout(t);
    }
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-24 md:bottom-8 right-4 z-50 pointer-events-none"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="bg-dutch-orange text-white font-bold px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <span>+{xp} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to trigger XP toast from any component
 */
export function useXPToast() {
  const [toast, setToast] = useState<{ xp: number; visible: boolean }>({
    xp: 0,
    visible: false,
  });

  const showXP = (xp: number) => {
    setToast({ xp, visible: true });
  };

  const dismiss = () => {
    setToast((t) => ({ ...t, visible: false }));
  };

  return { toast, showXP, dismiss };
}
