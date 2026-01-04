import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  WalletIcon,
  CogIcon,
  ChartBarIcon,
  HeartIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

const Sidebar = ({ user }) => {
  const location = useLocation();

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    ];

    switch (user?.role) {
      case "admin":
        return [
          ...baseItems,
          { name: "Users", href: "/users", icon: UserGroupIcon },
          { name: "Disasters", href: "/disasters", icon: ChartBarIcon },
          { name: "Settings", href: "/settings", icon: CogIcon },
        ];
      case "donor":
        return [
          ...baseItems,
          { name: "Donate", href: "/donate", icon: HeartIcon },
          { name: "History", href: "/history", icon: ChartBarIcon },
        ];
      case "beneficiary":
        return [
          ...baseItems,
          { name: "Relief", href: "/relief", icon: HeartIcon },
          { name: "Requests", href: "/requests", icon: WalletIcon },
        ];
      case "vendor":
        return [
          ...baseItems,
          { name: "Services", href: "/services", icon: BuildingOfficeIcon },
          { name: "Transactions", href: "/transactions", icon: ChartBarIcon },
        ];
      default:
        return baseItems;
    }
  };

  const navigation = getNavigationItems();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 shadow-sm h-full">
        <div className="flex flex-col flex-grow pt-6 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-5">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <div className="ml-3">
              <span className="text-lg font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Relief Platform
              </span>
              <p className="text-xs text-gray-500 -mt-0.5">Blockchain</p>
            </div>
          </div>

          <div className="mt-7 flex-1 flex flex-col px-3">
            <nav className="flex-1 space-y-0.5">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    } group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 mb-1.5`}
                  >
                    <item.icon
                      className={`${
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-gray-500"
                      } mr-3 h-5 w-5 flex-shrink-0`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-6 pb-4 px-4 border-t border-gray-200 bg-gradient-to-t from-gray-50 to-white">
              <div className="flex items-center">
                <div className="relative">
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-dashed border-blue-300 rounded-xl w-10 h-10 flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                    {user?.role?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 capitalize">
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
