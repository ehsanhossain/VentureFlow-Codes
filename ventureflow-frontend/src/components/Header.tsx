import React from "react";
import { Menu, X } from "lucide-react";
import Logo from "../assets/logo";
import LanguageSelect from "../components/dashboard/LanguageSelect";
import { BellIcon } from "../assets/icons";
import ProfileDropdown from "../components/dashboard/ProfileDropdown";

interface HeaderProps {
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

export function Header({ mobileMenuOpen, toggleMobileMenu }: HeaderProps) {
  return (
    <header className="h-16 bg-[#064771] border-b fixed top-0 left-0 right-0 z-40">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileMenu}
            className="p-2 hover:bg-gray-100 rounded-lg text-white lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          <div className="ml-0 lg:ml-[95px]">
            <Logo />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg relative">
            <BellIcon />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <LanguageSelect />

          <div className="flex items-center gap-3">
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
