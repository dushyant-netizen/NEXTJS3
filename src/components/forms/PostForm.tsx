"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { PostValidation } from "@/lib/validation";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/SupabaseAuthContext";
import FileUploader from "../shared/FileUploader";
import Loader from "../shared/Loader";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui";
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queriesAndMutations";
import { POST_CATEGORIES } from "@/constants";

type PostFormProps = {
  post?: any; // TODO: Add proper Supabase Post type
  action: "Create" | "Update";
};

const PostForm = ({ post, action }: PostFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUserContext();
  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post.location : "",
      tags: post ? (Array.isArray(post.tags) ? post.tags.join(",") : post.tags || "") : "",
      category: post ? post.category : "general",
    },
  });

  // Query
  const { mutateAsync: createPost, isPending: isLoadingCreate } =
    useCreatePost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } =
    useUpdatePost();

  // Handler
  const handleSubmit = async (value: z.infer<typeof PostValidation>) => {
    console.log('PostForm - Current user:', user)
    console.log('PostForm - User ID:', user?.id)
    
    if (!user?.id) {
      toast({
        title: "Authentication required. Please login again.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // ACTION = UPDATE
      if (post && action === "Update") {
        const updatedPost = await updatePost({
          ...value,
          postId: post.id,
          imageUrl: post.image_url,
        });

        if (!updatedPost) {
          toast({
            title: `${action} post failed. Please try again.`,
          });
          return;
        }
        
        toast({
          title: `Post ${action.toLowerCase()}d successfully!`,
        });
        return router.push(`/posts/${post.id}`);
      }

      // ACTION = CREATE
      console.log('PostForm - About to create post with userId:', user.id)
      const newPost = await createPost({
        ...value,
        userId: user.id,
      });

      if (!newPost) {
        toast({
          title: `${action} post failed. Please try again.`,
        });
        return;
      }
      
      toast({
        title: `Post ${action.toLowerCase()}d successfully!`,
      });
      router.push("/");
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing post:`, error);
      toast({
        title: `${action} post failed. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
  <form
    onSubmit={form.handleSubmit(handleSubmit)}
    className="flex flex-col gap-6 w-full max-w-2xl mx-auto" // Balanced spacing and max-width
  >
    {/* Caption - Increased visual height */}
    <FormField
      control={form.control}
      name="caption"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-semibold text-light-2">Caption</FormLabel>
          <FormControl>
            <Textarea
              className="shad-textarea custom-scrollbar min-h-[120px] bg-dark-3/50 border-none focus-visible:ring-1 focus-visible:ring-primary-500"
              placeholder="What's on your mind?"
              {...field}
            />
          </FormControl>
          <FormMessage className="text-xs text-red-500" />
        </FormItem>
      )}
    />

    {/* File Uploader - Given more breathing room */}
    <FormField
      control={form.control}
      name="file"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-semibold text-light-2">Media</FormLabel>
          <FormControl>
            <FileUploader fieldChange={field.onChange} mediaUrl={post?.imageUrl} />
          </FormControl>
        </FormItem>
      )}
    />

    {/* Group Location and Category in a row for better UI balance */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-light-2">Location</FormLabel>
            <FormControl>
              <Input type="text" className="shad-input bg-dark-3/50" placeholder="e.g. San Francisco" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-light-2">Category</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="shad-input bg-dark-3/50">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-dark-2 border-dark-4">
                {POST_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="hover:bg-dark-3 cursor-pointer">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    </div>

    {/* Tags - Kept separate to keep the grid clean */}
    <FormField
      control={form.control}
      name="tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-semibold text-light-2">Tags (comma separated)</FormLabel>
          <FormControl>
            <Input placeholder="Art, Design, Tech" type="text" className="shad-input bg-dark-3/50" {...field} />
          </FormControl>
        </FormItem>
      )}
    />

    {/* Footer Buttons - Standardized height and focus */}
    <div className="flex gap-4 items-center justify-end pt-4 border-t border-dark-4/50">
      <Button
        type="button"
        variant="ghost"
        className="text-light-2 hover:bg-dark-3"
        onClick={() => router.back()}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        className="bg-primary-500 hover:bg-primary-500/90 text-white px-8 h-11"
        disabled={isLoadingCreate || isLoadingUpdate}
      >
        {(isLoadingCreate || isLoadingUpdate) ? <Loader /> : `${action} Post`}
      </Button>
    </div>
  </form>
</Form>
  );
};

export default PostForm;
