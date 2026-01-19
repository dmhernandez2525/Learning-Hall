import React from 'react';
import { Toast as ToastType, ToastType as ToastVariant } from './ToastContext';

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const getToastStyles = (type: ToastVariant): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    padding: '12px 20px',
    borderRadius: '4px',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    animation: 'slideIn 0.3s ease-out',
    minWidth: '280px',
    maxWidth: '400px',
  };

  const typeStyles: Record<ToastVariant, React.CSSProperties> = {
    success: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
    },
    error: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb',
    },
    warning: {
      backgroundColor: '#fff3cd',
      color: '#856404',
      border: '1px solid #ffeeba',
    },
    info: {
      backgroundColor: '#d1ecf1',
      color: '#0c5460',
      border: '1px solid #bee5eb',
    },
  };

  return { ...baseStyles, ...typeStyles[type] };
};

const getIconForType = (type: ToastVariant): string => {
  switch (type) {
    case 'success':
      return '\u2713'; // Checkmark
    case 'error':
      return '\u2717'; // X mark
    case 'warning':
      return '\u26A0'; // Warning triangle
    case 'info':
      return '\u2139'; // Info symbol
    default:
      return '';
  }
};

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  return (
    <div
      style={getToastStyles(toast.type)}
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span aria-hidden="true">{getIconForType(toast.type)}</span>
        <span>{toast.message}</span>
      </span>
      <button
        onClick={() => onClose(toast.id)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '18px',
          marginLeft: '12px',
          opacity: 0.7,
        }}
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
};

export default Toast;
