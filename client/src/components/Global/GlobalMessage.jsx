import { useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const GlobalMessage = () => {
  const message = useSelector((state) => state.allMenu.message || state.image.message || state.modelData.message || state.predictImage.message);
  useEffect(() => {
    if (message ) {
      toast.success(message); // Show toast only if message is new
    }
  }, [message]);

  return null; // No UI rendering is needed
};

export default GlobalMessage;
