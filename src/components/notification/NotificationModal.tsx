import React, { JSX } from "react";

// Types for modal props
export type NotificationModalType = "success" | "error" | "warning";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: NotificationModalType;
  title: string;
  message: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
}) => {
  if (!isOpen) return null;

  const typeConfig: Record<NotificationModalType, { icon: JSX.Element; color: string }> = {
    success: { 
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ), 
      color: "text-green-500" 
    },
    error: { 
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ), 
      color: "text-red-500" 
    },
    warning: { 
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ), 
      color: "text-yellow-500" 
    },
  };

  const config = typeConfig[type];

  return (
    <dialog className="modal modal-open">
      <div className="modal-box rounded-lg shadow-lg text-center">
        <div className="flex flex-col items-center space-y-4">
          {/* Icon */}
          <div className={config.color}>
            {config.icon}
          </div>
          
          {/* Title */}
          <h3 className="font-bold text-xl">
            {title}
          </h3>
          
          {/* Message */}
          <p className="leading-relaxed">
            {message}
          </p>
          
          {/* Close Button */}
          <div className="modal-action">
            <button className="btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default NotificationModal;