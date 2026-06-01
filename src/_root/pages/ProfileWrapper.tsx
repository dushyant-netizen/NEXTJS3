"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/SupabaseAuthContext";
import ShareProfileModal from "@/components/shared/ShareProfileModal";
import { 
  useGetUserById, 
  useGetUserPosts, 
  useGetFollowersCount, 
  useGetFollowingCount,
  useIsFollowing,
  useFollowUser,
  useUnfollowUser
} from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";
import LinkifiedText from "@/components/shared/LinkifiedText";
import LikedPosts from "./LikedPosts";
import PrivacySettings from "@/components/shared/PrivacySettings";

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

type ProfileWrapperProps = {
  params: { id: string };
};

const ProfileWrapper = ({ params }: ProfileWrapperProps) => {
  const { user } = useUserContext();
  const [activeTab, setActiveTab] = useState<'posts' | 'liked'>('posts');
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const id = params?.id;
  const isOwnProfile = user?.id === id;

  const { data: currentUser, isPending: isUserLoading, error: userError } = useGetUserById(id || "");
  const { data: userPosts, isPending: isPostsLoading } = useGetUserPosts(id || "");
  
  const { data: followersCount, isLoading: followersLoading } = useGetFollowersCount(id || "");
  const { data: followingCount, isLoading: followingLoading } = useGetFollowingCount(id || "");
  const { data: isCurrentlyFollowing, isLoading: isFollowingLoading } = useIsFollowing(id || "");
  
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  
  const handleFollowToggle = () => {
    if (!id) return;
    
    if (isCurrentlyFollowing) {
      unfollowMutation.mutate(id);
    } else {
      followMutation.mutate(id);
    }
  };

  // 🛠️ FIX: Transformed loading blocks to use min-h-screen to pull background canvas down immediately
  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen bg-dark-1">
        <Loader />
      </div>
    );
  }

  if (userError || !currentUser) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen bg-dark-1 px-4">
        <p className="text-light-1 bg-dark-2 px-4 py-2 rounded-xl border border-dark-4 text-sm">
          {userError ? "Error loading user profile" : "User space not found"}
        </p>
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
            className={`h-10 px-4 text-light-1 rounded-lg flex-1 flex items-center justify-center gap-2 transition-all ${
              showPrivacySettings ? "bg-primary-500 hover:bg-primary-600" : "bg-dark-4 hover:bg-dark-3"
            }`} 
            onClick={() => setShowPrivacySettings(!showPrivacySettings)}
          >
            <img 
              src="/assets/icons/profile-placeholder.svg" 
              alt="settings option symbol" 
              width={16} 
              height={16} 
              className="invert-white opacity-80"
            />
            <span className="whitespace-nowrap small-medium">Settings</span>
          </Button>
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
              isCurrentlyFollowing 
                ? "bg-dark-4 hover:bg-dark-3 border border-dark-4" 
                : "bg-primary-500 hover:bg-primary-600"
            }`}
            onClick={handleFollowToggle}
            disabled={followMutation.isPending || unfollowMutation.isPending || isFollowingLoading}
          >
            <span className="whitespace-nowrap small-medium">
              {followMutation.isPending || unfollowMutation.isPending 
                ? "Loading..." 
                : "Following" ? isCurrentlyFollowing : "Follow"
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
    // 🛠️ FIX: Injected min-h-screen, bg-dark-1, flex-1, and custom dark viewport styling rules to span full-screen
    <div className="profile-container w-full min-h-screen flex flex-col items-center bg-dark-1 text-light-1 max-w-5xl mx-auto pb-24 pt-4 px-4 sm:px-6">
      <ShareProfileModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        user={currentUser}
      />
      
      <div className="flex flex-col w-full">
        {/* main details row section heading layout component */}
        <div className="flex flex-row items-center gap-4 sm:gap-6 w-full">
          <img
            src={currentUser.image_url || "/assets/icons/profile-placeholder.svg"}
            alt="user avatar display artifact"
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
              <StatBlock value={isPostsLoading ? "..." : userPosts?.length || 0} label="Posts" />
              <StatBlock value={followersLoading ? "..." : followersCount || 0} label="Followers" />
              <StatBlock value={followingLoading ? "..." : followingCount || 0} label="Following" />
            </div>
          </div>
        </div>
        
        {/* limited separation margin layout properties context */}
        {currentUser.bio && (
          <div className="mt-2 w-full">
            <LinkifiedText 
              text={currentUser.bio}
              className="text-sm text-left text-light-2 block leading-relaxed"
            />
          </div>
        )}

        <ActionButtons />
      </div>

      {/* animation frame mapping logic wrappers */}
      <AnimatePresence>
        {isOwnProfile && showPrivacySettings && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 24 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="w-full overflow-hidden mb-4"
          >
            <PrivacySettings 
              currentPrivacy={currentUser.privacy_setting || 'public'}
              userId={currentUser.id}
              onClose={() => setShowPrivacySettings(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* horizontal visual divider tabs matrix rows */}
      <div className="flex border-t border-dark-4 w-full mt-2 pt-2">
        {isOwnProfile && (
          <div className="flex w-full">
            <button
              onClick={() => setActiveTab('posts')}
              className={`profile-tab rounded-l-lg transition-all ${
                activeTab === 'posts' && "!bg-dark-3 text-white font-semibold"
              }`}
            >
              <img src="/assets/icons/posts.svg" alt="posts feed selector icon" width={18} height={18} className="invert-white" />
              Posts
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`profile-tab rounded-r-lg transition-all ${
                activeTab === 'liked' && "!bg-dark-3 text-white font-semibold"
              }`}
            >
              <img src="/assets/icons/like.svg" alt="liked layout list tracking selection symbol" width={18} height={18} className="invert-white" />
              Liked Posts
            </button>
          </div>
        )}
      </div>

      {/* item render pipeline grid block wrapper routing content elements */}
      <div className="w-full flex-1 mt-4">
        {activeTab === 'posts' || !isOwnProfile ? (
          <GridPostList posts={userPosts || []} showUser={false} />
        ) : (
          <LikedPosts />
        )}
      </div>
    </div>
  );
};

export default ProfileWrapper;