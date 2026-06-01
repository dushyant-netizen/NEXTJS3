"use client";

import PostDetails from "./PostDetails";
import ClientLayoutWrapper from "@/components/shared/ClientLayoutWrapper"; // 💡 OPTIMIZATION: Swapped to absolute paths

interface PostDetailsWrapperProps {
  postId: string; // Kept for prop-type strictness if used by a parent route, but omitted internal fetches
}

const PostDetailsWrapper = ({ postId }: PostDetailsWrapperProps) => {
  /*
    🛠️ FIX: Removed the duplicate useGetPostById query hook. 
    PostDetails already extracts the postId from useParams and manages its own 
    loading/error boundaries natively, eliminating redundant database roundtrips.
  */
  return (
    <ClientLayoutWrapper>
      <PostDetails />
    </ClientLayoutWrapper>
  );
};

export default PostDetailsWrapper;