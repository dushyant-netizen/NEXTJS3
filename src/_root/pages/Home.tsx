"use client";

import Link from "next/link";
import { useGetFollowingFeed, useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/SupabaseAuthContext";
import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import UserCard from "@/components/shared/UserCard";
import { motion } from "framer-motion";

const Home = () => {
  const { user } = useUserContext();

  const {
    data: posts,
    isPending: isPostLoading,
    isError: isErrorPosts,
  } = useGetFollowingFeed();

  const {
    data: creators,
    isPending: isUserLoading,
    isError: isErrorCreators,
  } = useGetUsers(10);

  // Filter out current user safely from creator lists
  const otherUsers = creators?.filter((creator: any) => creator.id !== user?.id) || [];

  return (
    <div className="flex flex-row flex-1 w-full min-h-screen bg-dark-1">
      {/* LEFT COLUMN: FOLLOWING FEED */}
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full mb-6">Following Feed</h2>
          
          {isErrorPosts ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dark-4 bg-dark-2/40 rounded-xl">
              <p className="body-medium text-light-3">Unable to load your feed right now.</p>
            </div>
          ) : isPostLoading ? (
            <div className="flex justify-center items-center py-12 w-full">
              <Loader />
            </div>
          ) : posts && posts.length > 0 ? (
            <ul className="flex flex-col flex-1 gap-9 w-full">
              {posts.map((post: any) => (
                <li key={post.id} className="flex justify-center w-full">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          ) : (
            /* Refactored Empty Feed UI Box Wrapper */
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center border border-dark-4 bg-dark-2/20 rounded-2xl max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-full bg-dark-3 flex items-center justify-center mb-5 border border-dark-4 text-light-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 14C16.4183 14 20 17.5817 20 22H4C4 17.5817 7.58172 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-light-1 text-xl font-bold mb-2">Your feed is empty</h3>
              <p className="text-light-4 text-sm mb-6 max-w-sm leading-relaxed">
                Follow other people to see their posts in your feed, or share your very first post!
              </p>
              <div className="flex items-center gap-3 text-sm font-semibold text-primary-500">
                <Link href="/explore" className="hover:text-primary-400 transition-colors">
                  Explore Posts
                </Link>
                <span className="text-dark-4 font-normal">•</span>
                <Link href="/all-users" className="hover:text-primary-400 transition-colors">
                  Find People
                </Link>
                <span className="text-dark-4 font-normal">•</span>
                <Link href="/create-post" className="hover:text-primary-400 transition-colors">
                  Create Post
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

 {/* RIGHT SIDEBAR: CREATOR SUGGESTIONS */}
<div className="home-creators border-l border-dark-4/40 pl-6">
  <h3 className="h3-bold text-light-1 mb-6">People You Might Know</h3>
  
  {isErrorCreators ? (
    <div className="p-6 border border-dark-4 bg-dark-2/40 rounded-2xl text-center">
      <p className="small-medium text-light-4">Failed to load suggestions.</p>
    </div>
  ) : isUserLoading ? (
    <div className="flex justify-center items-center py-12">
      <Loader />
    </div>
  ) : otherUsers.length > 0 ? (
    <div className="space-y-4">
      {otherUsers.slice(0, 5).map((creator: any, index: number) => (
        <motion.div
          key={creator?.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
        >
          <UserCard user={creator} />
        </motion.div>
      ))}
    </div>
  ) : (
    <div className="bg-dark-2/30 border border-dark-4 rounded-2xl p-8 text-center">
      <p className="text-light-4">No suggestions available at the moment</p>
    </div>
  )}
</div>
    </div>
  );
};

export default Home;