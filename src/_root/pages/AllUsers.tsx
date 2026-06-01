"use client";

import { useState } from "react";
import Loader from "@/components/shared/Loader";
import UserCard from "@/components/shared/UserCard";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/SupabaseAuthContext";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { useGetUsers, useSearchUsers } from "@/lib/react-query/queriesAndMutations";

const AllUsers = () => {
  const { toast } = useToast();
  const { user } = useUserContext();
  const [searchValue, setSearchValue] = useState("");
  
  const debouncedSearch = useDebounce(searchValue, 300);
  const isSearchMode = debouncedSearch.trim().length > 0;

  // 💡 OPTIMIZATION: Only enable requests conditionally based on user intent
  const { 
    data: allUsers, 
    isLoading: isLoadingUsers, 
    isError: isErrorUsers 
  } = useGetUsers(!isSearchMode);

  const { 
    data: searchResults, 
    isLoading: isSearching, 
    isError: isErrorSearch 
  } = useSearchUsers(debouncedSearch, isSearchMode);

  const displayUsers = isSearchMode ? searchResults : allUsers;
  const isLoading = isSearchMode ? isSearching : isLoadingUsers;
  const isError = isSearchMode ? isErrorSearch : isErrorUsers;

  const otherUsers = displayUsers?.filter((creator) => creator.id !== user?.id) || [];

  // 🛠️ FIX: Standard UI fallback instead of a breaking empty return block
  if (isError) {
    return (
      <div className="common-container flex items-center justify-center min-h-[50vh]">
        <div className="text-center p-6 bg-dark-2/40 border border-dark-4 rounded-xl max-w-sm">
          <p className="text-light-3 font-medium mb-2">Something went wrong</p>
          <p className="text-light-4 text-xs">Could not fetch user directories at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="common-container min-h-screen bg-dark-1">
      <div className="user-container max-w-5xl mx-auto py-10 px-4 w-full">
        <div className="flex flex-col gap-6 w-full mb-8">
          <h2 className="h3-bold md:h2-bold text-light-1 text-left w-full">All Users</h2>
          
          {/* Animated Interactive Search Input */}
          <div className="w-full relative">
            <div className="flex items-center gap-3 w-full h-12 bg-dark-2 border border-dark-4 rounded-xl px-4 transition-all duration-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/10">
              <img
                src="/assets/icons/search.svg"
                width={18}
                height={18}
                alt="search"
                className="opacity-40"
              />
              <Input
                type="text"
                placeholder="Search users by name or username..."
                className="flex-1 h-full bg-transparent border-none outline-none text-light-1 placeholder:text-light-4 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue("")}
                  className="text-light-4 hover:text-light-1 transition-colors p-1 rounded-md hover:bg-dark-3"
                  type="button"
                  aria-label="Clear search"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full">
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader />
            </div>
          ) : (
            <>
              {/* Dynamic Sub-header Analytics Context */}
              {isSearchMode && (
                <div className="mb-6 flex items-center gap-2 text-light-4 text-sm pl-1">
                  {isSearching ? (
                    <>
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                      <span>Searching directory...</span>
                    </>
                  ) : (
                    <>
                      <span>Found {otherUsers.length} matching result{otherUsers.length !== 1 ? 's' : ''} for</span>
                      <span className="text-primary-500 font-semibold bg-primary-500/10 px-2 py-0.5 rounded-md">"{debouncedSearch}"</span>
                    </>
                  )}
                </div>
              )}
              
              {/* Conditional Layout Routing */}
              {otherUsers.length > 0 ? (
                <ul className="user-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
                  {otherUsers.map((creator) => (
                    <li key={creator?.id} className="w-full transition-transform duration-200 hover:-translate-y-0.5">
                      <UserCard user={creator} />
                    </li>
                  ))}
                </ul>
              ) : (
                /* 🛠️ FIX: Shifted empty container outside list elements to fill container grid widths completely */
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dark-4 bg-dark-2/20 rounded-2xl max-w-md mx-auto px-4">
                  <div className="w-14 h-14 bg-dark-3 rounded-full flex items-center justify-center mb-4 border border-dark-4 text-light-4">
                    <img
                      src="/assets/icons/people.svg"
                      width={24}
                      height={24}
                      alt="no users"
                      className="opacity-40 invert-white"
                    />
                  </div>
                  <p className="text-light-2 text-base font-semibold mb-1">
                    {isSearchMode ? "No users found" : "No users available"}
                  </p>
                  <p className="text-light-4 text-xs leading-relaxed max-w-xs">
                    {isSearchMode 
                      ? `We couldn't find matches for "${debouncedSearch}". Double check your spelling and try again.`
                      : "There are no other active creator accounts listed on the platform directory yet."
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllUsers;