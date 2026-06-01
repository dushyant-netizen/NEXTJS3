"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

import useDebounce from "@/hooks/useDebounce";
import { useGetPosts, useSearchPosts } from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";
import { Input } from "@/components/ui/input"; // 🛠️ FIX: Fixed empty module path import string reference

export type SearchResultProps = {
  isSearchFetching: boolean;
  searchedPosts: any;
};

const SearchResults = ({ isSearchFetching, searchedPosts }: SearchResultProps) => {
  if (isSearchFetching) {
    return (
      <div className="flex justify-center items-center py-10 w-full">
        <Loader />
      </div>
    );
  } 
  
  if (searchedPosts && searchedPosts.length > 0) {
    return <GridPostList posts={searchedPosts} />;
  } 
  
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center w-full">
      <p className="text-light-4 text-sm bg-dark-2 border border-dark-4 px-4 py-2 rounded-xl">
        No posts matched your search criteria.
      </p>
    </div>
  );
};

const Explore = () => {
  const { ref, inView } = useInView();
  const { data: posts, fetchNextPage, hasNextPage, isLoading: isInitialLoading } = useGetPosts();

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);
  const isSearchMode = debouncedSearch.trim().length > 0;

  // 💡 OPTIMIZATION: Configured dynamic query triggering to prevent execution on empty values
  const { data: searchedPosts, isFetching: isSearchFetching } = useSearchPosts(
    debouncedSearch,
    isSearchMode // assuming query mutation infrastructure accepts a query toggle, or configure it via { enabled: isSearchMode } inside your custom hook declaration
  );

  useEffect(() => {
    if (inView && !searchValue && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, searchValue, hasNextPage]);

  if (isInitialLoading || !posts) {
    return (
      <div className="flex justify-center items-center w-full h-screen bg-dark-1">
        <Loader />
      </div>
    );
  }

  const shouldShowSearchResults = searchValue !== "";
  const shouldShowEmptyMessage = !shouldShowSearchResults && 
    posts.pages.every((item) => !item || !item.documents || item.documents.length === 0);

  return (
    <div className="explore-container min-h-screen bg-dark-1 w-full pb-10">
      <div className="explore-inner_container max-w-5xl mx-auto w-full px-4">
        <h2 className="h3-bold md:h2-bold text-light-1 mb-6">Search Posts</h2>
        
        {/* Modern Interactive Search Bar Layout */}
        <div className="flex gap-3 px-4 w-full h-12 rounded-xl bg-dark-2 border border-dark-4 items-center transition-all duration-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/10">
          <img
            src="/assets/icons/search.svg"
            width={20}
            height={20}
            alt="search"
            className="opacity-40"
          />
          <Input
            type="text"
            placeholder="Search keywords, phrases, titles..."
            className="flex-1 h-full bg-transparent border-none outline-none text-light-1 placeholder:text-light-4 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => setSearchValue("")}
              className="text-light-4 hover:text-light-1 p-1 rounded-md transition-colors hover:bg-dark-3"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row Section */}
      <div className="flex justify-between items-center w-full max-w-5xl mx-auto mt-14 mb-7 px-4">
        <h3 className="body-bold md:h3-bold text-light-1">Popular Today</h3>

        <div className="flex items-center gap-3 bg-dark-2 border border-dark-4 hover:bg-dark-3 transition-colors rounded-xl px-4 py-2 cursor-pointer shadow-sm">
          <p className="small-medium md:base-medium text-light-2">All</p>
          <img
            src="/assets/icons/filter.svg"
            width={16}
            height={16}
            alt="filter"
            className="invert-white opacity-80"
          />
        </div>
      </div>

      {/* Grid Content Frame Routing */}
      <div className="w-full max-w-5xl mx-auto px-4">
        {shouldShowSearchResults ? (
          <SearchResults
            isSearchFetching={isSearchFetching}
            searchedPosts={searchedPosts}
          />
        ) : shouldShowEmptyMessage ? (
          <div className="flex justify-center items-center py-14 text-center w-full">
            <p className="text-light-4 text-sm bg-dark-2/40 border border-dark-4/60 px-4 py-2 rounded-xl">
              No content items have broken trends yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-9 w-full">
            {posts.pages
              .filter((item) => item !== undefined)
              .map((item, index) => (
                <motion.div
                  key={`page-${index}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="w-full"
                >
                  <GridPostList posts={item.documents} />
                </motion.div>
              ))}
          </div>
        )}
      </div>

      {/* Infinite Intersection Monitor Fallback element */}
      {hasNextPage && !searchValue && (
        <div ref={ref} className="mt-12 flex justify-center w-full">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Explore;