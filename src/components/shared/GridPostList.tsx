"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/SupabaseAuthContext";
import PostStats from "./PostStats";

type GridPostListProps = {
  posts: any[]; // Posts array from Supabase
  showUser?: boolean;
  showStats?: boolean;
  showComments?: boolean;
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
  showComments = true,
}: GridPostListProps) => {
  const { user } = useUserContext();
  const router = useRouter();

  // Safeguard if data array isn't populated or returns null/undefined
  if (!posts || posts.length === 0) {
    return (
      <div className="flex-center w-full min-h-[200px] text-dark-4 text-sm">
        No posts available yet.
      </div>
    );
  }

  return (
    <ul className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl px-4 py-6 mx-auto">
      {posts.map((post) => {
        const postId = post.id || post.$id;
        // Fallback placeholder image if url is null or broken
        const postImg = post.image_url || post.imageUrl || "https://placehold.co/600x600/1F1F22/FFFFFF?text=No+Image";

        return (
          <li 
            key={postId} 
            className="relative w-full h-80 rounded-2xl overflow-hidden border border-dark-4 bg-dark-3 group cursor-pointer transition-all duration-300 hover:scale-[1.01]"
          >
            {/* Post Image Container */}
            <Link href={`/posts/${postId}`} className="block w-full h-full">
              <img
                src={postImg}
                alt="post text content"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  // Catches broken server URLs on runtime error
                  (e.target as HTMLImageElement).src = "https://placehold.co/600x600/1F1F22/FFFFFF?text=No+Image";
                }}
              />
            </Link>

            {/* Bottom Overlay Layer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-dark-1/95 via-dark-1/50 to-transparent flex items-center justify-between gap-2">
              {showUser && (
                <div className="flex items-center justify-start gap-2 flex-1">
                  <img
                    src={
                      post.creator?.image_url || post.creator?.imageUrl ||
                      "/assets/icons/profile-placeholder.svg"
                    }
                    alt="creator avatar"
                    className="w-8 h-8 rounded-full object-cover border border-dark-4"
                  />
                  <p className="line-clamp-1 text-light-1 text-sm font-medium">
                    {post.creator?.name || "User"}
                  </p>
                </div>
              )}
              
              {showStats && (
                <div className="bg-dark-2/40 backdrop-blur-md rounded-xl p-1.5 px-2 transition-colors hover:bg-dark-2/70">
                  <PostStats 
                    post={post} 
                    userId={user?.id || ""} 
                    showComments={showComments}
                    onCommentClick={() => {
                      // Optimized Next.js SPA push navigation strategy
                      router.push(`/posts/${postId}`);
                    }}
                  />
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default GridPostList;