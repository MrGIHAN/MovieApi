import React, { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
}) => {
  const modalRef = useRef(null);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4',
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm transition-opacity"
        onClick={handleBackdropClick}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`
            relative transform overflow-hidden rounded-lg bg-netflix-darkGray 
            text-left shadow-2xl transition-all w-full ${sizeClasses[size]} ${className}
          `}
          style={{ maxHeight: '90vh' }}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-netflix-gray">
              {title && (
                <h3
                  id="modal-title"
                  className="text-lg font-semibold text-white"
                >
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-netflix-lightGray hover:text-white transition-colors duration-200 p-1"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 4rem)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Header Component
export const ModalHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-netflix-gray ${className}`}>
    {children}
  </div>
);

// Modal Body Component
export const ModalBody = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

// Modal Footer Component
export const ModalFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-netflix-gray flex justify-end space-x-3 ${className}`}>
    {children}
  </div>
);

// Confirmation Modal
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to continue?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger', 'warning', 'info'
}) => {
  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </ModalHeader>
      
      <ModalBody>
        <p className="text-netflix-lightGray">{message}</p>
      </ModalBody>
      
      <ModalFooter>
        <button
          onClick={onClose}
          className="btn btn-secondary"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`btn text-white ${variantStyles[variant]}`}
        >
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
};

// Image Modal
export const ImageModal = ({ 
  isOpen, 
  onClose, 
  src, 
  alt, 
  title 
}) => (
  <Modal 
    isOpen={isOpen} 
    onClose={onClose} 
    size="xl"
    className="bg-transparent shadow-none"
  >
    <div className="relative">
      <img
        src={src}
        alt={alt}
        className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
      />
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
          <h3 className="text-white text-lg font-semibold">{title}</h3>
        </div>
      )}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-netflix-lightGray bg-black/50 rounded-full p-2"
        aria-label="Close image"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
    </div>
  </Modal>
);

// Video Modal
export const VideoModal = ({ 
  isOpen, 
  onClose, 
  src, 
  title,
  autoPlay = true,
  controls = true 
}) => (
  <Modal 
    isOpen={isOpen} 
    onClose={onClose} 
    size="xl"
    className="bg-black"
  >
    <div className="relative aspect-video">
      <video
        src={src}
        className="w-full h-full"
        autoPlay={autoPlay}
        controls={controls}
        muted={autoPlay}
      />
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="text-white text-lg font-semibold">{title}</h3>
        </div>
      )}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-netflix-lightGray bg-black/50 rounded-full p-2"
        aria-label="Close video"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
    </div>
  </Modal>
);

export default Modal;