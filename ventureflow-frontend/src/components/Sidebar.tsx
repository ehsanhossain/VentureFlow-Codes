import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { menuItems } from "../config/menuItems";
import { Label } from "../assets/label";

interface SidebarProps {
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  mobileMenuOpen: boolean;
}

export function Sidebar({
  sidebarExpanded,
  setSidebarExpanded,
  mobileMenuOpen,
}: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r transition-all duration-300 z-30
        ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }
        ${sidebarExpanded ? "w-64" : "w-16"}`}
    >
      <div className="relative h-full flex flex-col">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="p-2 hover:bg-gray-100 rounded-lg hidden md:block absolute -right-4 top-2 bg-white border shadow-sm z-50"
        >
          {sidebarExpanded ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Navigation Menu */}
        <nav className="flex-1 flex items-center justify-center">
          <div className="space-y-1 w-full px-2">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={index}
                  to={item.path || "/"}
                  className={`
    flex items-center rounded-lg transition-all w-full px-2
    ${sidebarExpanded && isActive ? "bg-gray-200 text-gray-900" : ""}
  `}
                >
                  <div
                    className={`
      p-2 rounded-lg transition-colors
      ${!sidebarExpanded && isActive ? "bg-gray-200 text-gray-900" : ""}
      ${!isActive ? "text-gray-700 hover:bg-gray-100" : ""}
    `}
                  >
                    <item.icon className="w-6 h-6 shrink-0" />
                  </div>

                  {/* Label - visible only when expanded */}
                  <span
                    className={`
      transition-all duration-300 text-sm font-medium whitespace-nowrap ml-2
      ${sidebarExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}
    `}
                  >
                    <Label text={item.label} />
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
