import React from 'react';
import { AlertTriangle } from 'lucide-react';

const OfflineIndicator = () => {
  return (
    <div className="offline-indicator">
      <div className="container">
        <div className="flex flex-center" style={{ gap: '0.5rem' }}>
          <AlertTriangle size={16} />
          <span>You are currently offline. Some features may be limited.</span>
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;
