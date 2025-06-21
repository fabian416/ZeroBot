import React from "react";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#321e4c] to-[#1a1028] backdrop-blur-md border-t border-purple-500/20 py-6 shadow-xl shadow-purple-900/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">ZB</span>
            </div>
            <span className="text-white font-semibold text-lg">ZeroBot</span>
          </div>
          <p className="text-sm text-purple-200/80 font-medium">
            © {new Date().getFullYear()} ZeroBot. All rights reserved.
          </p>
          <p className="text-xs text-purple-300/60 mt-1">
            Privacy-first ZK-based reCAPTCHA
          </p>
        </div>
      </div>
    </footer>
  );
};
  