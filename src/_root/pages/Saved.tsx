"use client";

import { motion } from "framer-motion";
import { useGetCurrentUser, useGetSavedPosts } from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";

const Saved = () => {
  const { data: currentUser, isPending: isUserLoading } = useGetCurrentUser();
  
  // 💡 OPTIMIZATION: Condition query enablement so it stays idle until user session securely hydrates
  const { data: savedPosts, isLoading: isLoadingSaved } = useGetSavedPosts(
    currentUser?.id || "",
    !!currentUser?.id
  );

  if (isUserLoading || !currentUser) {
    return (
      <div className="flex justify-center items-center w-full h-screen bg-dark-1">
        <Loader />
      </div>
    );
  }

  const hasNoSavedPosts = !savedPosts || savedPosts.length === 0;

  return (
    <div className="saved-container min-h-screen bg-dark-1 w-full pb-12 px-4 md:px-6">
      {/* Title Segment Block Row Header */}
      <div className="flex items-center gap-3 w-full max-w-5xl mx-auto mb-10 pt-4">
        <img
          src="/assets/icons/save.svg"
          width={32}
          height={32}
          alt="Saved bookmarks page header logo component"
          className="invert-white opacity-90"
        />
        <h2 className="h3-bold md:h2-bold text-left text-light-1 tracking-tight">
          Saved Posts
        </h2>
      </div>

      {/* Main Core View Area Content Controller Frame */}
      <div className="w-full max-w-5xl mx-auto flex justify-center">
        {isLoadingSaved ? (
          <div className="py-20">
            <Loader />
          </div>
        ) : hasNoSavedPosts ? (
          /* 🛠️ FIX: Stylized dashed bounding box empty container structure replaces raw semantic unstyled p tags */
          <div className="flex flex-col items-center justify-center py-20 text-center w-full border border-dark-4 border-dashed bg-dark-2/10 rounded-3xl max-w-lg px-4 animate-fade-in">
            <div className="w-14 h-14 bg-dark-3 border border-dark-4 rounded-2xl flex items-center justify-center mb-4 text-light-3 shadow-md">
              <img 
                src="/assets/icons/save.svg" 
                alt="Bookmark empty layout decoration illustration" 
                width={22} 
                height={22} 
                className="opacity-40 invert-white"
              />
            </div>
            <p className="text-light-2 text-sm font-semibold mb-1">Your bookmark board is empty</p>
            <p className="text-light-4 text-xs max-w-xs leading-relaxed">
              Save ideas, design details, and interesting items you come across on your explore timeline to access them in one centralized dashboard panel.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full"
          >
            <GridPostList posts={savedPosts} showStats={false} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Saved;