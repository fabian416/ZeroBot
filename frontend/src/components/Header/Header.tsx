"use client";

import React, { useState } from "react";
import { Bars3Icon } from "@heroicons/react/20/solid";
import { Link, useLocation } from 'react-router-dom';

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  }
];

export const HeaderMenuLinks = () => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <>
      {menuLinks?.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              to={href}
              className={`${
                isActive ? "bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg" : ""
              } bg-gradient-to-r from-purple-600/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-400 focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-blue-500 text-white active:!text-white py-2 px-4 text-sm rounded-xl gap-2 grid grid-flow-col transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25`}
            >
              {icon}
              <span className="font-semibold">{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};


export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="sticky lg:static bg-gradient-to-r from-[#321e4c] to-[#4a2d6b] top-0 navbar min-h-0 flex-shrink-0 justify-between z-20 shadow-xl shadow-purple-900/50 px-4 backdrop-blur-md border-b border-purple-500/20">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <div className="sm:hidden dropdown">
            <label
              tabIndex={0}
              className={`btn btn-ghost text-white hover:bg-purple-600/20 transition-all duration-300 ${isDrawerOpen ? "hover:bg-purple-600/30" : "hover:bg-purple-600/20"}`}
              onClick={() => {
                setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
              }}
            >
              <Bars3Icon className="h-1/2 w-8" />
            </label>
            {isDrawerOpen && (
              <ul
                tabIndex={0}
                className="menu menu-compact dropdown-content mt-3 p-2 shadow-xl bg-gradient-to-br from-[#321e4c] to-[#1a1028] rounded-2xl w-52 border border-purple-500/30 backdrop-blur-md"
                onClick={() => {
                  setIsDrawerOpen(false);
                }}
              >
                <HeaderMenuLinks />
              </ul>
            )}
          </div>
          <div className="flex justify-center items-center w-16 h-16 ml-2 mr-4">
            <Link to="/" className="hover:scale-110 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-white font-bold text-lg">ZB</span>
              </div>
            </Link>
          </div>
          <ul className="hidden sm:flex lg:flex-nowrap menu menu-horizontal px-1 gap-3">
            <HeaderMenuLinks />
          </ul>
        </div>
      </div>
    </div>
  );
};