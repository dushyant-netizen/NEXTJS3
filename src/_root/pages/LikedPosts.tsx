"use client";

import { motion } from "framer-motion";
import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useGetLikedPosts } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/SupabaseAuthContext";

const LikedPosts = () => {
  const { user } = useUserContext();
  
  // 💡 OPTIMIZATION: Passing an empty string fallback ensures TanStack Query doesn't request invalid 'undefined' endpoints
  const { data: likedPosts, isPending, isError } = useGetLikedPosts(user?.id || "");

  if (isPending) {
    return (
      <div className="flex justify-center items-center w-full py-20 bg-dark-1">
        <Loader />
      </div>
    );
  }

  // Graceful state handler if network or context calls fail entirely
  if (isError) {
    return (
      <div className="flex justify-center items-center py-16 w-full text-center">
        <p className="text-light-4 text-sm border border-dark-4 bg-dark-2/40 px-4 py-2 rounded-xl">
          Error retrieving your saved collection.
        </p>
      </div>
    );
  }

  const hasNoLikedPosts = !likedPosts || likedPosts.length === 0;

  return (
    <div className="w-full min-h-[40vh]">
      {hasNoLikedPosts ? (
        /* 🛠️ FIX: Stylized empty placeholder container to prevent ugly left-aligned unstyled prose texts */
        <div className="flex flex-col items-center justify-center py-16 text-center w-full border border-dark-4 border-dashed bg-dark-2/10 rounded-2xl max-w-lg mx-auto px-4">
          <div className="w-12 h-12 bg-dark-3 rounded-full flex items-center justify-center mb-3 text-light-4">
            <img 
              src="/assets/icons/like.svg" 
              alt="Heart icon" 
              width={20} 
              height={20} 
              className="opacity-30 invert-white"
            />
          </div>
          <p className="text-light-2 text-sm font-semibold mb-0.5">No liked posts yet</p>
          <p className="text-light-4 text-xs max-w-xs leading-relaxed">
            Posts you interact with or give a heart to across the explore pages will appear inside this tab area.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full animate-fade-in"
        >
          <GridPostList posts={likedPosts} showStats={false} />
        </motion.div>
      )}
    </div>
  );
};

export default LikedPosts;