import React from "react";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#321e4c] to-[#1a1028] backdrop-blur-md border-t border-purple-500/20 py-2 shadow-xl shadow-purple-900/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm text-white font-medium">
            © {new Date().getFullYear()} ZeroBot. All rights reserved.
          </p>
          <p className="text-xs text-white mt-1">
            Privacy-first ZK-based reCAPTCHA
          </p>
        </div>
      </div>
    </footer>
  );
};
  