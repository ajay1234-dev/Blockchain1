import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UserGroupIcon,
  WalletIcon,
  CogIcon,
  ChartBarIcon,
  HeartIcon,
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
          {
            name: "Request Disaster",
            href: "/request-disaster",
            icon: WalletIcon,
          },
        ];

      default:
        return baseItems;
    }
  };

  const navigation = getNavigationItems();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-lg border-r border-gray-700/50 h-full">
        <div className="flex flex-col flex-grow pt-6 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-5">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
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
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Relief Platform
              </span>
              <p className="text-xs text-gray-400 -mt-0.5">Blockchain</p>
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
                        ? "bg-gradient-to-r from-indigo-600/80 to-purple-600/80 text-white shadow-lg shadow-indigo-500/20"
                        : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    } group flex items-center px-4 py-3.5 text-sm font-medium rounded-lg transition-all duration-200 mb-1.5`}
                  >
                    <item.icon
                      className={`${
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-white"
                      } mr-3 h-5 w-5 flex-shrink-0`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-6 pb-4 px-4 border-t border-gray-700/50 bg-gradient-to-t from-gray-800/50 to-gray-900/50">
              <div className="flex items-center">
                <div className="relative">
                  <div className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 border border-gray-600/50 rounded-lg w-10 h-10 flex items-center justify-center shadow-inner">
                    <svg
                      className="h-6 w-6 text-indigo-400"
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
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500/80 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-gray-800">
                    {user?.role?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 capitalize border border-indigo-500/30">
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
