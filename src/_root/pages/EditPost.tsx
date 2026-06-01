"use client";

import { useParams } from "next/navigation"; // 🛠️ FIX: Changed from "react-router-dom" to standard Next.js navigation
import { motion } from "framer-motion";
import PostForm from "@/components/forms/PostForm";
import { useGetPostById } from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";

const EditPost = () => {
  const params = useParams();
  // Ensure we safely extract the string ID out of Next.js routing structures
  const postId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  const { data: post, isLoading, isError } = useGetPostById(postId || "");

  // Full screen loader framework shell
  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-screen bg-dark-1">
        <Loader />
      </div>
    );
  }

  // 🛠️ FIX: Added a protective check if post was deleted or not found
  if (isError || !post) {
    return (
      <div className="common-container flex items-center justify-center min-h-[60vh] bg-dark-1">
        <div className="text-center p-6 bg-dark-2/40 border border-dark-4 rounded-xl max-w-sm">
          <p className="text-light-3 font-medium mb-1">Post not found</p>
          <p className="text-light-4 text-xs">The post you are trying to edit doesn't exist or has been removed.</p>
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
      <div className="common-container max-w-5xl mx-auto py-10 px-4 w-full flex flex-col gap-10">
        
        {/* Header Block Alignment */}
        <div className="flex items-center gap-3 w-full border-b border-dark-4/60 pb-6">
          <div className="p-2.5 bg-dark-2 border border-dark-4 rounded-xl">
            <img
              src="/assets/icons/edit.svg"
              width={24}
              height={24}
              alt="edit post icon"
              className="invert-white"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="h3-bold md:h2-bold text-light-1 text-left w-full">Edit Post</h2>
            <p className="text-xs text-light-3 mt-0.5">Modify the contents or details of your post</p>
          </div>
        </div>

        {/* Cleaned form wrapper shell */}
        <div className="w-full bg-dark-2/20 border border-dark-4/40 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-sm">
          <PostForm action="Update" post={post} />
        </div>
        
      </div>
    </motion.div>
  );
};

export default EditPost;