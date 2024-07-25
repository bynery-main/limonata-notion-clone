import React from 'react';

interface ConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ onConfirm, onCancel }) => {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md"
      onClick={handleOverlayClick}
    >
      <div
        className="relative bg-white rounded-[53px] shadow-2xl p-10 w-[606px] z-[10000]"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: 'white', opacity: 1 }} // Ensure the background is fully opaque
      >
        <div className="text-center mb-8">
          <h2 className="font-medium text-black text-3xl mb-2">Are you sure you want to delete your account?</h2>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onConfirm}
            className="bg-[#ff5924] text-white font-normal text-[15px] rounded-[50px] px-6 py-3 shadow-md hover:bg-[#e54e1f] transition-colors"
            style={{ color: 'white' }} // Ensure the text color is white
          >
            Delete Account
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 font-normal text-[15px] rounded-[50px] px-6 py-3 shadow-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
