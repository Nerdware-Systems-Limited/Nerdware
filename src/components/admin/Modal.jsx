import { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ title, onClose, children, footer, maxWidth = 520 }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="nw-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="nw-modal" style={{ maxWidth }}>
        <div className="nw-modal__hd">
          <h3>{title}</h3>
          <button
            type="button"
            className="nw-icon-btn"
            onClick={onClose}
            aria-label="Close"
            style={{ width: 32, height: 32 }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="nw-modal__bd">{children}</div>
        {footer && <div className="nw-modal__ft">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
