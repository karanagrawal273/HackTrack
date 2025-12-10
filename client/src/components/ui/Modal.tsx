// D:\HackTrack\client\src\components\ui\Modal.tsx

'use client';

import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4" onClick={onClose}>
      {/* Modal Container */}
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()} // Stop click inside from closing modal
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 p-4">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">
            &times;
          </button>
        </div>
        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;