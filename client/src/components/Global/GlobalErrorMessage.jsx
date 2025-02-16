import { useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const GlobalErrorMessage = () => {
  const errorMessage = useSelector((state) => state.allMenu.error || state.predictImage.error);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage); // Show toast only if message is new
    }
  }, [errorMessage]);

  return null; // No UI rendering is needed
};

export default GlobalErrorMessage;
