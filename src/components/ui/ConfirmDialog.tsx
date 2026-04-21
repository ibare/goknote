import { AnimatePresence, motion } from 'framer-motion';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive,
}: ConfirmDialogProps) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          key="bd"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-50"
          onClick={onCancel}
        />
        <motion.div
          key="dialog"
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-surface rounded-card p-6 w-full max-w-[320px] shadow-lift">
            <h3 className="text-[17px] font-semibold mb-2">{title}</h3>
            {description && <p className="text-[14px] text-ink-2 mb-5">{description}</p>}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 h-11 rounded-pill border border-line text-[14px] font-medium"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 h-11 rounded-pill text-[14px] font-medium ${
                  destructive ? 'bg-red-500 text-white' : 'bg-ink text-surface'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);
