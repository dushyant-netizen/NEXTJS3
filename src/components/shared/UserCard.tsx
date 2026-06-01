import Link from "next/link";
import { Button } from "../ui/button";
import { useIsFollowing, useFollowUser, useUnfollowUser } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/SupabaseAuthContext";

type UserCardProps = {
  user: any;
};

const UserCard = ({ user }: UserCardProps) => {
  const { user: currentUser } = useUserContext();
  const { data: isCurrentlyFollowing, isLoading: isFollowingLoading } = useIsFollowing(user.id);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCurrentlyFollowing) {
      unfollowMutation.mutate(user.id);
    } else {
      followMutation.mutate(user.id);
    }
  };

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <Link 
      href={`/profile/${user.id}`} 
      className="group flex items-center gap-4 p-4 bg-dark-2 hover:bg-dark-3 border border-dark-4 hover:border-primary-500/30 rounded-2xl transition-all duration-200"
    >
      {/* Profile Picture */}
      <div className="relative">
        <img
          src={user.image_url || "/assets/icons/profile-placeholder.svg"}
          alt={user.name}
          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-dark-4 group-hover:ring-primary-500 transition-all"
        />
        {/* Online Status Indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-dark-2"></div>
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-light-1 truncate group-hover:text-primary-500 transition-colors">
          {user.name}
        </p>
        <p className="text-light-3 text-sm truncate">
          @{user.username}
        </p>
      </div>

      {/* Follow Button */}
      {!isOwnProfile && (
        <Button 
          type="button" 
          size="sm" 
          className={`min-w-[90px] transition-all ${
            isCurrentlyFollowing 
              ? "bg-dark-4 hover:bg-dark-3 text-light-1 border border-dark-4" 
              : "bg-primary-500 hover:bg-primary-600 text-white"
          }`}
          onClick={handleFollowToggle}
          disabled={followMutation.isPending || unfollowMutation.isPending || isFollowingLoading}
        >
          {followMutation.isPending || unfollowMutation.isPending 
            ? "..." 
            : isCurrentlyFollowing 
              ? "Following" 
              : "Follow"
          }
        </Button>
      )}
    </Link>
  );
};

export default UserCard;