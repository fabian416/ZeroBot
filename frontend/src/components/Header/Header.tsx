"use client";

import React, { useState } from "react";
import { Bars3Icon } from "@heroicons/react/20/solid";
import { ConnectButton } from "@rainbow-me/rainbowkit";
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
                isActive ? "bg-[#2833c7] shadow-md" : ""
              } bg-[#2833c7] hover:shadow-md focus:!bg-[#2833c7] text-white active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
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
    <div className="sticky lg:static bg-[#2833c7] top-0 navbar min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-2">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <div className="sm:hidden dropdown">
            <label
              tabIndex={0}
              className={`btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
              onClick={() => {
                setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
              }}
            >
              <Bars3Icon className="h-1/2 w-8" />
            </label>
            {isDrawerOpen && (
              <ul
                tabIndex={0}
                className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
                onClick={() => {
                  setIsDrawerOpen(false);
                }}
              >
                <HeaderMenuLinks />
              </ul>
            )}
          </div>
          <div className="flex justify-center items-center w-16 h-16 ml-2 mr-2">
            <Link to="/">
              <img src="/logo.png" alt="logo" />
            </Link>
          </div>
          <ul className="hidden sm:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
            <HeaderMenuLinks />
          </ul>
        </div>

        <div className="flex items-center pr-2">
          <ConnectButton showBalance={false} />
        </div>
      </div>
    </div>
  );
};