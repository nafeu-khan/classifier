import { useSelector } from "react-redux";
import React from "react";

const GlobalLoader = () => {
  const loading = useSelector((state) => state.allMenu.loading || state.modelData.loading || state.predictImage.loading);

  if (!loading) return null; // Render nothing if not loading

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="loader border-t-4 border-b-4 border-blue-500 w-12 h-12 rounded-full animate-spin"></div>
    </div>
  );
};

export default GlobalLoader;
