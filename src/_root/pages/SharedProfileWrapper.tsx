"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/SupabaseAuthContext";
import SharedPostTopbar from "@/components/shared/SharedPostTopbar";
import ShareProfileModal from "@/components/shared/ShareProfileModal";
import AuthPromptModal from "@/components/shared/AuthPromptModal";
import { 
  useGetUserById, 
  useGetUserPosts, 
  useGetFollowersCount, 
  useGetFollowingCount,
  useIsFollowing,
  useFollowUser,
  useUnfollowUser,
  useGetPublicUserById,
  useGetPublicUserPosts,
  useGetPublicFollowersCount,
  useGetPublicFollowingCount
} from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";
import LinkifiedText from "@/components/shared/LinkifiedText";
import LikedPosts from "./LikedPosts";

interface StatBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StatBlockProps) => (
  <div className="flex items-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

type SharedProfileWrapperProps = {
  params: { id: string };
};

const SharedProfileWrapper = ({ params }: SharedProfileWrapperProps) => {
  const { user } = useUserContext();
  const [activeTab, setActiveTab] = useState<'posts' | 'liked'>('posts');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authAction, setAuthAction] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const id = params?.id;
  const isAuthenticated = !!user;
  const isOwnProfile = isAuthenticated && user?.id === id;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 💡 OPTIMIZATION: Queries only mount context conditionally based on auth status, halting layout-overfetching leaks
  const { data: authenticatedUser, isPending: isAuthUserLoading, error: authUserError } = useGetUserById(id || "", isAuthenticated);
  const { data: publicUser, isPending: isPublicUserLoading, error: publicUserError } = useGetPublicUserById(id || "", !isAuthenticated);
  
  const { data: authenticatedUserPosts, isPending: isAuthPostsLoading } = useGetUserPosts(id || "", isAuthenticated);
  const { data: publicUserPosts, isPending: isPublicPostsLoading } = useGetPublicUserPosts(id || "", !isAuthenticated);
  
  const { data: authenticatedFollowersCount } = useGetFollowersCount(id || "", isAuthenticated);
  const { data: publicFollowersCount } = useGetPublicFollowersCount(id || "", !isAuthenticated);
  
  const { data: authenticatedFollowingCount } = useGetFollowingCount(id || "", isAuthenticated);
  const { data: publicFollowingCount } = useGetPublicFollowingCount(id || "", !isAuthenticated);

  // Consolidated operational pipeline context variables
  const currentUser = isAuthenticated ? authenticatedUser : publicUser;
  const isUserLoading = isAuthenticated ? isAuthUserLoading : isPublicUserLoading;
  const userError = isAuthenticated ? authUserError : publicUserError;
  const userPosts = isAuthenticated ? authenticatedUserPosts : publicUserPosts;
  const isPostsLoading = isAuthenticated ? isAuthPostsLoading : isPublicPostsLoading;
  const followersCount = isAuthenticated ? authenticatedFollowersCount : publicFollowersCount;
  const followingCount = isAuthenticated ? authenticatedFollowingCount : publicFollowingCount;

  const { data: isCurrentlyFollowing, isLoading: isFollowingLoading } = useIsFollowing(
    id || "",
    isAuthenticated && !!id
  );
  
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  
  const handleFollowToggle = () => {
    if (!isAuthenticated) {
      setAuthAction("follow users");
      setShowAuthPrompt(true);
      return;
    }
    if (!id) return;
    
    if (isCurrentlyFollowing) {
      unfollowMutation.mutate(id);
    } else {
      followMutation.mutate(id);
    }
  };

  // Safe SSR hydration guard layout execution wrapper
  if (!isMounted || isUserLoading) {
    return (
      <div className="w-full bg-dark-1 min-h-screen">
        <SharedPostTopbar />
        <div className="flex justify-center items-center py-40 w-full">
          <Loader />
        </div>
      </div>
    );
  }
  
  if (userError || !currentUser) {
    return (
      <div className="w-full bg-dark-1 min-h-screen">
        <SharedPostTopbar />
        <div className="flex justify-center items-center py-32 w-full px-4">
          <p className="text-light-1 bg-dark-2 border border-dark-4 text-sm px-4 py-2 rounded-xl text-center max-w-sm">
            {userError ? "Error processing query channel records." : "Requested user layout signature missing."}
          </p>
        </div>
      </div>
    );
  }

  const ActionButtons = () => (
    <div className="flex gap-2 w-full mt-3">
      {isOwnProfile ? (
        <>
          <Link
            href={`/update-profile/${currentUser.id}`}
            className="h-10 bg-dark-4 px-4 text-light-1 flex items-center justify-center gap-2 rounded-lg hover:bg-dark-3 flex-1 text-sm font-medium transition-colors"
          >
            Edit Profile
          </Link>
          <Button 
            type="button" 
            className="h-10 bg-dark-4 px-4 text-light-1 rounded-lg hover:bg-dark-3 flex-1 text-sm font-medium transition-colors" 
            onClick={() => setShowShareModal(true)}
          >
            Share Profile
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            className={`h-10 px-4 text-light-1 flex items-center justify-center gap-2 rounded-lg flex-1 font-medium transition-all ${
              isAuthenticated && isCurrentlyFollowing 
                ? "bg-dark-4 hover:bg-dark-3 border border-dark-4" 
                : "bg-primary-500 hover:bg-primary-600"
            }`}
            onClick={handleFollowToggle}
            disabled={followMutation.isPending || unfollowMutation.isPending || isFollowingLoading}
          >
            <span className="whitespace-nowrap small-medium">
              {followMutation.isPending || unfollowMutation.isPending 
                ? "Loading..." 
                : isAuthenticated && isCurrentlyFollowing 
                  ? "Following" 
                  : isAuthenticated ? "Follow" : "Sign in to Follow"
              }
            </span>
          </Button>
          <Button 
            type="button" 
            className="h-10 bg-dark-4 px-4 text-light-1 rounded-lg hover:bg-dark-3 flex-1 text-sm font-medium transition-colors" 
            onClick={() => setShowShareModal(true)}
          >
            Share Profile
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="w-full bg-dark-1 min-h-screen pb-12">
      <SharedPostTopbar />
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="profile-container max-w-5xl mx-auto px-4 md:px-6 mt-6"
      >
        <div className="flex flex-col w-full">
          {/* Main profile avatar header information row context */}
          <div className="flex flex-row items-center gap-4 sm:gap-6 w-full">
            <img
              src={currentUser?.image_url || "/assets/icons/profile-placeholder.svg"}
              alt="user visual identification portrait"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex-shrink-0 object-cover border border-dark-4"
            />
            <div className="flex flex-col items-start w-full">
              <h1 className="text-left text-xl sm:text-2xl font-bold text-light-1 tracking-tight">
                {currentUser.name}
              </h1>
              <p className="text-sm text-light-3 text-left font-medium">
                @{currentUser.username}
              </p>

              <div className="flex gap-4 sm:gap-6 mt-3">
                <StatBlock value={userPosts?.length || 0} label="Posts" />
                <StatBlock value={followersCount || 0} label="Followers" />
                <StatBlock value={followingCount || 0} label="Following" />
              </div>
            </div>
          </div>
          
          {/* Biography text section display formatting rules */}
          {currentUser.bio && (
            <div className="mt-2 w-full">
              <LinkifiedText 
                text={currentUser.bio}
                className="text-sm text-left text-light-2 leading-relaxed block"
              />
            </div>
          )}

          <ActionButtons />
        </div>
        
        {/* Dynamic workspace context toggle navigation borders */}
        <div className="flex border-t border-dark-4 w-full mt-6 pt-2">
          {(isAuthenticated || isOwnProfile) && (
            <div className="flex w-full">
              <button
                onClick={() => setActiveTab('posts')}
                className={`profile-tab rounded-l-lg transition-colors ${
                  activeTab === 'posts' && "!bg-dark-3 text-white font-medium"
                }`}
              >
                <img src="/assets/icons/posts.svg" alt="posts grid icon selection node" width={18} height={18} className="invert-white" />
                Posts
              </button>
              
              {isOwnProfile && (
                <button
                  onClick={() => setActiveTab('liked')}
                  className={`profile-tab rounded-r-lg transition-colors ${
                    activeTab === 'liked' && "!bg-dark-3 text-white font-medium"
                  }`}
                >
                  <img src="/assets/icons/like.svg" alt="liked dynamic content tab tracker icon" width={18} height={18} className="invert-white" />
                  Liked Posts
                </button>
              )}
            </div>
          )}
        </div>

        {/* Unified data viewport grid visualization rendering container panel */}
        <div className="w-full mt-4">
          {activeTab === 'posts' || !isOwnProfile ? (
            isPostsLoading ? (
              <div className="flex justify-center py-12"><Loader /></div>
            ) : userPosts && userPosts.length > 0 ? (
              <GridPostList posts={userPosts} showUser={false} showStats={true} />
            ) : (
              <div className="text-center py-16 border border-dark-4 border-dashed rounded-2xl bg-dark-2/10 max-w-md mx-auto px-4">
                <p className="text-light-2 text-sm font-semibold">No uploaded post elements found</p>
                <p className="text-light-4 text-xs mt-1">This user timeline does not contain publicly broadcast uploads.</p>
              </div>
            )
          ) : (
            /* 🛠️ FIX: Hardened security fence wrapper keeps the liked panel component isolated behind full verification keys */
            isOwnProfile && isAuthenticated ? <LikedPosts /> : null
          )}
        </div>
      </motion.div>

      {/* Dynamic application modal interface layers */}
      <AnimatePresence mode="wait">
        {showShareModal && currentUser && (
          <ShareProfileModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            user={currentUser}
          />
        )}
      </AnimatePresence>

      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        action={authAction}
      />
    </div>
  );
};

export default SharedProfileWrapper;