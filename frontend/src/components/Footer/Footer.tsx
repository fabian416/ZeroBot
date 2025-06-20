import React from "react";

export const Footer = () => {
  return (
    <footer className="bg-[#2833c7] backdrop-blur-sm border-t py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm text-white">
            © {new Date().getFullYear()} ZeroBot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
  