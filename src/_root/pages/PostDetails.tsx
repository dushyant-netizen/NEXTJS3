"use client";

import { useParams, useRouter } from "next/navigation"; // 🛠️ FIX: Upgraded routing elements from react-router-dom
import Link from "next/link"; 
import { motion } from "framer-motion";
import {
  useGetPostById,
  useGetUserPosts,
  useDeletePost,
} from "@/lib/react-query/queriesAndMutations";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/SupabaseAuthContext";
import { Button } from "@/components/ui/button"; // 🛠️ FIX: Target the explicit module instead of broken barrel root
import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import GridPostList from "@/components/shared/GridPostList";
import Comments from "@/components/shared/Comments";

const PostDetails = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useUserContext();

  const postId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { data: post, isLoading: isPostLoading } = useGetPostById(postId || "");
  
  // 💡 OPTIMIZATION: Only enable user profile feed query fetch when creator details are hydrated safely
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.creator?.id || "",
    !!post?.creator?.id
  );
  
  const { mutate: deletePost } = useDeletePost();

  const relatedPosts = userPosts?.filter(
    (userPost: any) => userPost.id !== postId
  ) || [];

  const handleDeletePost = () => {
    if (!postId) return;
    
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (confirmDelete) {
      deletePost({ postId: postId }, {
        onSuccess: () => router.back()
      });
    }
  };

  if (isPostLoading) {
    return (
      <div className="flex justify-center items-center w-full h-screen bg-dark-1">
        <Loader />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="common-container flex items-center justify-center min-h-[60vh] bg-dark-1">
        <div className="text-center p-6 bg-dark-2/40 border border-dark-4 rounded-xl max-w-sm">
          <p className="text-light-3 font-medium mb-1">Post not found</p>
          <p className="text-light-4 text-xs">The resource you are attempting to look up does not exist or was deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="post_details-container min-h-screen bg-dark-1 w-full pb-14">
      {/* Back Toolbar Navigation Block Row */}
      <div className="hidden md:flex max-w-5xl w-full mx-auto px-4 mb-4">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="shad-button_ghost hover:bg-dark-2 text-light-2 gap-2"
        >
          <img
            src="/assets/icons/back.svg"
            alt="back navigation element"
            width={24}
            height={24}
            className="invert-white"
          />
          <span className="small-medium lg:base-medium">Back</span>
        </Button>
      </div>

      {/* Main Core Detail Card Block Frame */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="post_details-card max-w-5xl mx-auto w-full bg-dark-2 border border-dark-4 rounded-3xl overflow-hidden shadow-xl"
      >
        <img
          src={post?.image_url}
          alt="post visualization artifact"
          className="post_details-img w-full max-h-[600px] object-cover"
        />

        <div className="post_details-info p-6 md:p-8 flex flex-col gap-6">
          <div className="flex justify-between items-center w-full gap-4">
            <Link
              href={`/profile/${post?.creator?.id}`}
              className="flex items-center gap-3 group"
            >
              <img
                src={post?.creator?.image_url || "/assets/icons/profile-placeholder.svg"}
                alt="user avatar profile reference"
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover border border-dark-4"
              />
              <div className="flex flex-col">
                <p className="base-medium lg:body-bold text-light-1 group-hover:text-primary-500 transition-colors">
                  {post?.creator?.name}
                </p>
                <div className="flex items-center gap-2 text-light-3 text-xs mt-0.5">
                  <p className="subtle-semibold lg:small-regular">
                    {multiFormatDateString(post?.$createdAt)}
                  </p>
                  <span>•</span>
                  <p className="subtle-semibold lg:small-regular text-light-4">
                    {post?.location || "Global"}
                  </p>
                </div>
              </div>
            </Link>

            {/* Author Administrative Controls Toolbar */}
            {user?.id === post?.creator?.id && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/update-post/${post?.id}`}
                  className="p-2 bg-dark-3 hover:bg-dark-4 border border-dark-4 rounded-xl transition-colors"
                  title="Modify configuration details"
                >
                  <img
                    src="/assets/icons/edit.svg"
                    alt="edit configuration reference"
                    width={20}
                    height={20}
                    className="invert-white opacity-80"
                  />
                </Link>

                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className="p-2 bg-dark-3 hover:bg-red/10 border border-dark-4 hover:border-red/40 rounded-xl transition-all group"
                  title="Remove post artifact permanently"
                >
                  <img
                    src="/assets/icons/delete.svg"
                    alt="delete element node"
                    width={20}
                    height={20}
                    className="invert-white opacity-80 group-hover:opacity-100"
                  />
                </Button>
              </div>
            )}
          </div>

          <hr className="border-t border-dark-4/60 w-full" />

          {/* Description Prose Content Frame Details */}
          <div className="flex flex-col flex-1 w-full text-sm md:text-base text-light-2 leading-relaxed">
            <p>{post?.caption}</p>
            {post?.tags?.length > 0 && (
              <ul className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag: string, index: number) => (
                  <li
                    key={`${tag}-${index}`}
                    className="text-primary-500 text-xs bg-primary-500/5 border border-primary-500/10 px-2.5 py-1 rounded-md font-medium"
                  >
                    #{tag}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <hr className="border-t border-dark-4/60 w-full" />

          <div className="w-full">
            <PostStats post={post} userId={user?.id || ""} />
          </div>
        </div>
      </motion.div>

      {/* Synchronized Dedicated Discussion Comment Subgrid Section Layout */}
      {postId && (
        <div className="w-full max-w-5xl mx-auto px-4 mt-8">
          <div className="bg-dark-2/40 border border-dark-4/60 rounded-3xl p-6 md:p-8">
            <h3 className="body-bold md:h3-bold text-light-1 mb-6">Discussion</h3>
            <Comments postId={postId} />
          </div>
        </div>
      )}

      {/* Suggested Related Stream Matrices Block Box */}
      <div className="w-full max-w-5xl mx-auto px-4 mt-12 border-t border-dark-4/60 pt-10">
        <h3 className="body-bold md:h3-bold text-light-1 mb-8">
          More From This Creator
        </h3>
        
        {isUserPostLoading ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : relatedPosts.length > 0 ? (
          <GridPostList posts={relatedPosts} />
        ) : (
          <p className="text-light-4 text-xs bg-dark-2/40 border border-dark-4/60 p-4 rounded-xl text-center max-w-sm">
            No other related uploads found from this account.
          </p>
        )}
      </div>
    </div>
  );
};

export default PostDetails;