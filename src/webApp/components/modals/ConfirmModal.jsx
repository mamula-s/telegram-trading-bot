import React from 'react';
import Modal from '../Modal';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Підтвердження', 
  message,
  confirmText = 'Підтвердити',
  cancelText = 'Скасувати',
  type = 'info' // 'info', 'warning', 'success', 'error'
}) => {
  const icons = {
    info: <Info className="w-6 h-6 text-blue-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
    success: <CheckCircle className="w-6 h-6 text-green-500" />,
    error: <XCircle className="w-6 h-6 text-red-500" />
  };

  const styles = {
    info: 'bg-blue-50 border-blue-100',
    warning: 'bg-yellow-50 border-yellow-100',
    success: 'bg-green-50 border-green-100',
    error: 'bg-red-50 border-red-100'
  };

  const buttonStyles = {
    info: 'bg-blue-600 hover:bg-blue-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    success: 'bg-green-600 hover:bg-green-700',
    error: 'bg-red-600 hover:bg-red-700'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      showCloseButton={false}
    >
      <div className={`p-6 ${styles[type]} rounded-t-2xl border-b`}>
        <div className="flex gap-4">
          {icons[type]}
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="mt-1 text-gray-600">{message}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-white rounded-b-2xl flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 text-white rounded-xl transition-colors ${buttonStyles[type]}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;