import React from "react";

const ConversationLoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500"></div>
      </div>
    </div>
  );
};

export default ConversationLoadingSpinner;
