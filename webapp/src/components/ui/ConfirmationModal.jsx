import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // "danger", "warning", "info"
  requiresTyping = false,
  requiredText = "DELETE",
  isLoading = false
}) => {
  const [typedText, setTypedText] = useState('');
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(requiresTyping);

  const handleTypedTextChange = (e) => {
    const value = e.target.value;
    setTypedText(value);
    if (requiresTyping) {
      setIsConfirmDisabled(value !== requiredText);
    }
  };

  const handleConfirm = () => {
    if (requiresTyping && typedText !== requiredText) {
      return;
    }
    onConfirm();
  };

  const handleClose = () => {
    setTypedText('');
    setIsConfirmDisabled(requiresTyping);
    onClose();
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          border: 'border-red-200'
        };
      case 'warning':
        return {
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          border: 'border-yellow-200'
        };
      default:
        return {
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          border: 'border-blue-200'
        };
    }
  };

  const styles = getTypeStyles();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all ${styles.border} border`}>
          {/* Header */}
          <div className="px-6 pt-6">
            <div className="flex items-start">
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                <AlertTriangle className={`h-6 w-6 ${styles.iconColor}`} />
              </div>
              <div className="ml-4 text-left">
                
              </div>
              <button
                onClick={handleClose}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <div className="text-sm text-gray-600 whitespace-pre-line">
              {message}
            </div>

            {/* Typing confirmation */}
            {requiresTyping && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-mono font-bold text-red-600">{requiredText}</span> to confirm:
                </label>
                <input
                  type="text"
                  value={typedText}
                  onChange={handleTypedTextChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={`Type "${requiredText}" here`}
                  disabled={isLoading}
                />
                {typedText && typedText !== requiredText && (
                  <p className="mt-1 text-sm text-red-600">
                    Please type "{requiredText}" exactly as shown
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirmDisabled || isLoading}
              className={`w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm ${styles.confirmButton}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
