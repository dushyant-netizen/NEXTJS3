"use client";

import { motion } from "framer-motion";
import PostFormNextJS from "@/components/forms/PostFormNextJS"; // 💡 OPTIMIZATION: Updated relative paths to use clean root aliases
import { useGetPostById } from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";

interface EditPostWrapperProps {
  postId: string;
}

const EditPostWrapper = ({ postId }: EditPostWrapperProps) => {
  const { data: post, isLoading, isError } = useGetPostById(postId);

  // Loading wrapper overlay
  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-screen bg-dark-1">
        <Loader />
      </div>
    );
  }

  // 🛠️ FIX: Stylized error fallback to keep the frame elegant if queries return blank
  if (isError || !post) {
    return (
      <div className="common-container flex items-center justify-center min-h-[60vh] bg-dark-1">
        <div className="text-center p-6 bg-dark-2/40 border border-dark-4 rounded-xl max-w-sm">
          <p className="text-light-3 font-medium mb-1">Post not found</p>
          <p className="text-light-4 text-xs">The post you are attempting to edit could not be retrieved.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 min-h-screen bg-dark-1"
    >
      <div className="common-container max-w-5xl mx-auto py-10 px-4 w-full flex flex-col gap-10 pb-32 md:pb-12">
        
        {/* Header Title Block */}
        <div className="flex items-center gap-3 w-full border-b border-dark-4/60 pb-6">
          <div className="p-2.5 bg-dark-2 border border-dark-4 rounded-xl">
            <img
              src="/assets/icons/edit.svg"
              width={24}
              height={24}
              alt="edit"
              className="invert-white"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="h3-bold md:h2-bold text-light-1 text-left w-full">Edit Post</h2>
            <p className="text-xs text-light-3 mt-0.5">Update and modify details for this entry</p>
          </div>
        </div>

        {/* Dynamic Form Framework Component */}
        <div className="w-full bg-dark-2/20 border border-dark-4/40 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-sm">
          <PostFormNextJS action="Update" post={post} />
        </div>

      </div>
    </motion.div>
  );
};

export default EditPostWrapper;