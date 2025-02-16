"use client";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import { Toaster } from 'react-hot-toast'; // Import Toaster
import StoreProvider from "@/app/StoreProvider";
import GlobalLoader from "@/components/Global/GlobalLoader";
import GlobalMessage from "@/components/Global/GlobalMessage";
import GlobalErrorMessage from "@/components/Global/GlobalErrorMessage";

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <StoreProvider>
          <GlobalLoader />
          <GlobalMessage />
          <GlobalErrorMessage />
          <div className="dark:bg-boxdark-2 dark:text-bodydark">
            {loading ? <Loader /> : children}
            <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
