import { useState, useEffect } from 'react';
import { RiCheckLine, RiCloseLine, RiErrorWarningLine } from 'react-icons/ri';
import './Toast.css';

export default function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <RiCheckLine size={18} />,
    error: <RiCloseLine size={18} />,
    warning: <RiErrorWarningLine size={18} />,
  };

  return (
    <div className={`toast toast--${type} ${visible ? 'toast--visible' : 'toast--hidden'}`}>
      <span className="toast__icon">{icons[type]}</span>
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={() => { setVisible(false); onClose?.(); }}>
        <RiCloseLine size={16} />
      </button>
    </div>
  );
}
