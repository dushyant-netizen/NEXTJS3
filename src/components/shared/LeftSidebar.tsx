"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { INavLink } from "@/types";
import { sidebarLinks, INITIAL_USER } from "@/constants";
import { Button } from "@/components/ui/button";
import SearchModal from "@/components/shared/SearchModal";
import {
  useSignOutAccount,
  useCheckAdminAccess,
} from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/SupabaseAuthContext";
import NotificationBell from "./NotificationBell";
import Loader from "./Loader";

const LeftSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, setIsAuthenticated, isLoading } = useUserContext();
  const { data: hasAdminAccess } = useCheckAdminAccess();
  const [isHovered, setIsHovered] = useState(false);

  const { mutate: signOut } = useSignOutAccount();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSignOut = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    router.push("/sign-in");
  };

  return (
    <nav
      className={`group fixed left-0 top-0 h-screen bg-dark-2 border-r border-dark-4 transition-all duration-300 ease-in-out flex flex-col justify-between py-6 ${
        isHovered ? "w-64" : "w-20"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Header: Branding */}
      <div className="h-15  flex items-center px-5">
        <Link href="/" className="flex items-center gap-3">
          <img
            src={
              isHovered
                ? "/assets/images/LOGOS (1).png"
                : "/assets/images/favicon.ico"
            }
            alt="logo"
            className={`transition-all duration-300 ease-in-out ${
              isHovered ? "w-32" : "w-9"
            }`}
          />
        </Link>
      </div>

      {/* 2. Navigation List: Centered Vertically */}
      <div className="flex-1 flex flex-col justify-center px-3">
        <ul className="flex flex-col gap-2">
          {sidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;

           // Special case for Notifications to prevent 404 navigation
// Special case for Notifications to prevent 404 navigation
if (link.label === "Notification" || link.label === "Notifications") {
  return (
    <li key={link.label}>
      <div
        className={`flex items-center p-3 rounded-xl transition-all relative ${
          pathname === "/notifications" ? "bg-primary-500 text-white" : "text-light-2 hover:bg-dark-3"
        } ${isHovered ? "gap-4" : "justify-center"}`}
      >
        <div className="relative flex items-center justify-center w-6 h-6">
          <NotificationBell />
        </div>
        {isHovered && <span className="truncate">Notifications</span>}
      </div>
    </li>
  );
}
            
            return (
              <li key={link.label}>
                <Link
                  href={link.route}
                  className={`flex items-center p-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-primary-500 text-white"
                      : "text-light-2 hover:bg-dark-3"
                  } ${isHovered ? "gap-4" : "justify-center"}`}
                >
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    className={`w-6 h-6 ${isActive ? "invert" : ""}`}
                  />
                  {isHovered && <span className="truncate">{link.label}</span>}
                </Link>
              </li>
            );
          })}

         

          {/* Messages Option */}
          <li>
            <Link
              href="/chat"
              className={`flex items-center p-3 rounded-xl transition-all relative ${
                pathname === "/chat"
                  ? "bg-primary-500 text-white"
                  : "text-light-2 hover:bg-dark-3"
              } ${isHovered ? "gap-4" : "justify-center"}`}
            >
              <div className="relative">
                <img
                  src="/assets/icons/chat.svg"
                  alt="chat"
                  className={`w-6 h-6 ${pathname === "/messages" ? "invert" : ""}`}
                />
              </div>
              {isHovered && <span className="truncate">Messages</span>}
            </Link>
          </li>

          <li>
  <button
    onClick={() => setIsSearchOpen(true)} // Opens the modal instead of navigating
    className={`w-full flex items-center p-3 rounded-xl transition-all ${
      isSearchOpen // Style it as active when open
        ? "bg-primary-500 text-white"
        : "text-light-2 hover:bg-dark-3"
    } ${isHovered ? "gap-4" : "justify-center"}`}
  >
    <img
      src="/assets/icons/search.svg"
      alt="Search"
      className={`w-6 h-6 ${isSearchOpen ? "invert" : ""}`}
    />
    {isHovered && <span className="truncate">Search</span>}
  </button>
</li>
        </ul>
      </div>

      {/* 3. Footer: Profile & Logout */}
      <div className="border-t border-dark-4 pt-4 px-3 space-y-2">
        {/* Profile */}
        <Link
          href={`/profile/${user?.id}`}
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-dark-3 transition-all ${!isHovered && "justify-center"}`}
        >
          <img
            src={user?.image_url || "/assets/icons/profile-placeholder.svg"}
            className="h-9 w-8 rounded-full object-cover"
          />
          {isHovered && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.name}</p>
              <p className="text-xs text-light-3 truncate">@{user?.username}</p>
            </div>
          )}
        </Link>
          
{/* Logout */}
<Button 
  variant="ghost" 
  className="w-full justify-start p-3" // Standardize padding
  onClick={handleSignOut}
>
  <div className={`flex items-center ${isHovered ? "gap-4" : "justify-center w-full"}`}>
    <img 
      src="/assets/icons/logout.svg" 
      className="w-6 h-6" 
      alt="logout" 
    />
    {isHovered && <span className="truncate">Logout</span>}
  </div>
</Button>
      </div>
      <SearchModal 
  isOpen={isSearchOpen} 
  onClose={() => setIsSearchOpen(false)} 
/>
    </nav>
  );
};

export default LeftSidebar;
