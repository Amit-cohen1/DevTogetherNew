import { Toaster } from 'react-hot-toast';
import React from 'react';

const ToastProvider: React.FC = () => {
  return (
    <>
      {/* Desktop Toaster - Top Right */}
      <div className="hidden md:block">
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
        />
      </div>

      {/* Mobile Toaster - Top Center */}
      <div className="block md:hidden">
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
        />
      </div>
    </>
  );
};

export default ToastProvider;