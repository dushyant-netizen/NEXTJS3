"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/SupabaseAuthContext";
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
import { PRIVACY_SETTINGS } from "@/constants";

interface StatBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StatBlockProps) => (
  <div className="flex flex-col items-center min-w-[80px] bg-dark-3/30 border border-dark-4/20 px-4 py-2 rounded-xl backdrop-blur-sm sm:bg-transparent sm:border-none sm:p-0">
    <p className="text-lg lg:text-2xl font-bold text-primary-500">{value}</p>
    <p className="text-xs font-medium text-light-3 mt-0.5 tracking-wide uppercase sm:normal-case sm:text-sm">{label}</p>
  </div>
);

type ProfileWrapperProps = {
  params: { id: string };
};

const ProfileWrapper = ({ params }: ProfileWrapperProps) => {
  const { user } = useUserContext();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<'posts' | 'liked'>('posts');
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  
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

  const handleShareProfile = async () => {
    if (isCopying || !currentUser) return;
    
    const origin = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || "";
    const fullShareUrl = `${origin}${pathname}`;

    if (navigator.share && window.location.protocol === 'https:') {
      try {
        await navigator.share({
          title: `${currentUser.name}'s Profile`,
          text: `Check out ${currentUser.name}'s profile (@${currentUser.username})!`,
          url: fullShareUrl,
        });
        return;
      } catch (error) {
        console.warn("Native share initialization dropped:", error);
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(fullShareUrl);
        triggerCopyNotification();
        return;
      } catch (error) {
        console.error("Modern Clipboard API invocation exception:", error);
      }
    }

    try {
      const textArea = document.createElement("textarea");
      textArea.value = fullShareUrl;
      textArea.style.position = "fixed"; 
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      triggerCopyNotification();
    } catch (error) {
      console.error("Legacy fallbacks exhausted:", error);
      alert("Unable to copy profile link.");
    }
  };

  const triggerCopyNotification = () => {
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen bg-dark-1">
        <Loader />
      </div>
    );
  }

  if (userError || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-1 w-full px-4">
        <div className="text-center p-8 bg-dark-2 border border-dark-4 rounded-2xl max-w-sm w-full shadow-xl">
          <p className="text-light-2 font-semibold mb-2">
            {userError ? "Error Loading Profile" : "Profile Not Found"}
          </p>
          <p className="text-light-4 text-xs leading-relaxed">
            This account profile could not be safely resolved from the records. It may have been removed or altered.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      // 🛠️ CHANGED: Removed layout capping restrictions ('overflow-y-auto') and swapped to clean vertical container alignment
      className="flex flex-col items-center w-full min-h-screen bg-dark-1 text-light-1 pt-4 pb-20 px-4 sm:px-6 md:px-8"
    >
      <div className="flex flex-col w-full max-w-5xl gap-6">
        
        {/* Profile Card Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full bg-dark-2/40 border border-dark-4/40 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-md">
          <img
            src={currentUser.image_url || "/assets/icons/profile-placeholder.svg"}
            alt="Profile avatar"
            className="w-24 h-24 md:w-28 md:h-28 rounded-full flex-shrink-0 object-cover border-2 border-dark-4 shadow-md"
          />
          
          <div className="flex flex-col flex-1 items-center md:items-start justify-between w-full gap-5">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h1 className="text-2xl lg:text-4xl font-bold text-light-1 tracking-tight">
                {currentUser.name}
              </h1>
              <p className="text-sm md:text-base text-light-3 font-medium mt-1">
                @{currentUser.username}
              </p>

              {isOwnProfile && (
                <div className="flex items-center gap-1.5 mt-3 bg-dark-3 border border-dark-4 px-3 py-1 rounded-lg w-fit shadow-inner">
                  <span className="text-[11px] text-light-3 font-medium uppercase tracking-wider">Privacy:</span>
                  <span className="text-xs">
                    {PRIVACY_SETTINGS.find(s => s.value === currentUser.privacy_setting)?.icon || "🌍"}
                  </span>
                  <span className="text-xs font-semibold text-light-2 capitalize">
                    {PRIVACY_SETTINGS.find(s => s.value === currentUser.privacy_setting)?.label || "Public"}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Statistics Cluster */}
            <div className="flex gap-4 sm:gap-10 border-t border-dark-4/30 pt-5 w-full justify-center md:justify-start">
              <StatBlock value={isPostsLoading ? "..." : userPosts?.length || 0} label="Posts" />
              <StatBlock value={followersLoading ? "..." : followersCount || 0} label="Followers" />
              <StatBlock value={followingLoading ? "..." : followingCount || 0} label="Following" />
            </div>
          </div>
        </div>
        
        {/* Interactive Dynamic Bio Block */}
        {currentUser.bio && (
          <div className="w-full bg-dark-2/20 border border-dark-4/30 px-6 py-4 rounded-2xl shadow-sm">
            <p className="text-xs font-semibold text-light-3 uppercase tracking-wider mb-1.5 text-left">Biography</p>
            <LinkifiedText 
              text={currentUser.bio}
              className="text-sm sm:text-base text-light-2 leading-relaxed text-left block whitespace-pre-wrap"
            />
          </div>
        )}

        {/* Action Controls Panel Row */}
        <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
          {isOwnProfile ? (
            <>
              <Link
                href={`/update-profile/${currentUser.id}`}
                className="h-12 bg-dark-3 hover:bg-dark-4 border border-dark-4 text-light-1 flex items-center justify-center gap-2 rounded-xl transition-all flex-1 text-sm font-semibold tracking-wide shadow-sm"
              >
                Edit Profile
              </Link>
              <Button 
                type="button" 
                variant="ghost"
                className={`h-12 text-light-1 rounded-xl border border-dark-4 transition-all flex-1 text-sm font-semibold tracking-wide ${
                  showPrivacySettings ? "bg-primary-500 hover:bg-primary-600 border-transparent shadow-md" : "bg-dark-3 hover:bg-dark-4"
                }`} 
                onClick={() => setShowPrivacySettings(!showPrivacySettings)}
              >
                Settings
              </Button>
            </>
          ) : (
            <Button
              type="button"
              className={`h-12 text-light-1 rounded-xl flex-1 text-sm font-bold tracking-wide shadow-md transition-all ${
                isCurrentlyFollowing 
                  ? "bg-dark-3 hover:bg-dark-4 border border-dark-4" 
                  : "bg-primary-500 hover:bg-primary-600"
              }`}
              onClick={handleFollowToggle}
              disabled={followMutation.isPending || unfollowMutation.isPending || isFollowingLoading}
            >
              {followMutation.isPending || unfollowMutation.isPending 
                ? "Updating status..." 
                : isCurrentlyFollowing ? "Following Account" : "Follow User"
              }
            </Button>
          )}
          
          <Button 
            type="button" 
            className={`h-12 rounded-xl transition-all font-semibold text-sm flex-1 sm:flex-initial sm:px-8 shadow-sm ${
              isCopying ? "bg-green-600 text-white shadow-md scale-[1.02]" : "bg-dark-3 hover:bg-dark-4 border border-dark-4 text-light-1"
            }`} 
            onClick={handleShareProfile}
          >
            {isCopying ? "Link Copied!" : "Share Profile"}
          </Button>
        </div>
        
        {/* Animated Privacy Panel Segment */}
        <AnimatePresence>
          {isOwnProfile && showPrivacySettings && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full overflow-hidden mt-1"
            >
              <div className="p-1 bg-dark-2/30 rounded-2xl border border-dark-4/30 shadow-inner">
                <PrivacySettings 
                  currentPrivacy={currentUser.privacy_setting || "public"} 
                  userId={currentUser.id} 
                  value={currentUser.privacy_setting || "public"}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Visual Navigation Tab Header Sections */}
      <div className="flex border-b border-dark-4/50 w-full max-w-5xl mx-auto mt-10 mb-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center justify-center sm:justify-start gap-2.5 px-6 py-4 border-b-2 font-medium text-sm transition-all flex-1 sm:flex-none ${
            activeTab === 'posts' 
              ? "border-primary-500 text-primary-500 bg-primary-500/5 font-bold" 
              : "border-transparent text-light-3 hover:text-light-1"
          }`}
        >
          <img src="/assets/icons/posts.svg" alt="posts" width={18} height={18} className="invert-white opacity-80" />
          <span>Artifact Posts</span>
        </button>
        
        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex items-center justify-center sm:justify-start gap-2.5 px-6 py-4 border-b-2 font-medium text-sm transition-all flex-1 sm:flex-none ${
              activeTab === 'liked' 
                ? "border-primary-500 text-primary-500 bg-primary-500/5 font-bold" 
                : "border-transparent text-light-3 hover:text-light-1"
          }`}
          >
            <img src="/assets/icons/like.svg" alt="like" width={18} height={18} className="invert-white opacity-80" />
            <span>Liked Collection</span>
          </button>
        )}
      </div>

      {/* Main Bottom Stream Output Content Frame Matrix */}
      <div className="w-full max-w-5xl mx-auto flex-1">
        {activeTab === 'posts' ? (
          !userPosts || userPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-dark-2/10 border border-dashed border-dark-4/40 rounded-3xl w-full text-center">
              <img src="/assets/icons/posts.svg" alt="No posts found" className="w-10 h-10 opacity-30 mb-3 invert-white" />
              <p className="text-light-3 font-medium text-sm">No profile artifacts created yet.</p>
              <p className="text-light-4 text-xs mt-1">When this user shares records, they will display here.</p>
            </div>
          ) : (
            <div className="w-full animate-fade-in">
              <GridPostList posts={userPosts} showUser={false} showComments={false} />
            </div>
          )
        ) : (
          isOwnProfile && (
            <div className="w-full animate-fade-in">
              <LikedPosts />
            </div>
          )
        )}
      </div>
    </motion.div>
  );
};

export default ProfileWrapper;