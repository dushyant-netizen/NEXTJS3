"use client";

import { motion } from "framer-motion";
import PostForm from "@/components/forms/PostForm";

const CreatePost = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-1 min-h-screen bg-dark-1"
    >
      {/* Reduced max-w from 4xl to 2xl for a more focused, compact layout */}
      <div className="max-w-2xl mx-auto py-12 px-6 w-full flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 border border-primary-500/20 rounded-lg">
            <img
              src="/assets/icons/add-post.svg"
              width={20}
              height={20}
              alt="add post"
              className="invert-white"
            />
          </div>
          <h2 className="text-xl font-bold text-white">Create Post</h2>
        </div>

        {/* Compact Card Container */}
        <div className="w-full bg-dark-2/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md shadow-lg">
          <PostForm action="Create" />
        </div>
        
      </div>
    </motion.div>
  );
};

export default CreatePost;