"use client";

import React, { useEffect } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { ProfileValidation } from "@/lib/validation";
import { useUserContext } from "@/context/SupabaseAuthContext";
import { useGetUserById, useUpdateUser, useGetCurrentUser } from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import ProfileUploader from "@/components/shared/ProfileUploder";

type UpdateProfileWrapperProps = {
  params: { id: string };
};

const UpdateProfileWrapper = ({ params }: UpdateProfileWrapperProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const { id } = params;
  const { user, setUser } = useUserContext();
  
  // Queries
  const { data: currentUser, isPending: isLoadingUser } = useGetUserById(id || "");
  const { refetch: refetchCurrentUser } = useGetCurrentUser();
  const { mutateAsync: updateUser, isPending: isLoadingUpdate } = useUpdateUser();

  const form = useForm<z.infer<typeof ProfileValidation>>({
    resolver: zodResolver(ProfileValidation),
    defaultValues: {
      file: [],
      name: "",
      username: "",
      email: "",
      bio: "",
    },
  });

  // Keep form fields synced with remote profile data on async response finish
  useEffect(() => {
    if (currentUser) {
      form.reset({
        file: [],
        name: currentUser.name || "",
        username: currentUser.username || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
      });
    }
  }, [currentUser, form]);

  // Handle Loading State
  if (isLoadingUser || !currentUser) {
    return (
      <div className="flex justify-center items-center w-full h-[60vh] bg-dark-1">
        <Loader />
      </div>
    );
  }

  // Handle Form Submission Mutation
  const handleUpdate = async (value: z.infer<typeof ProfileValidation>) => {
    // 🛡️ SECURITY GUARD: Prevent non-owners from processing mutation payloads
    if (!user || user.id !== currentUser.id) {
      toast({
        title: "Action unauthorized",
        description: "You do not hold permissions to adjust this profile signature.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedUser = await updateUser({
        userId: currentUser.id,
        name: value.name,
        username: currentUser.username, 
        email: currentUser.email,
        bio: value.bio,
        file: value.file,
        imageUrl: currentUser.image_url,
      });

      if (!updatedUser) {
        toast({
          title: "Update profile failed.",
          description: "Please check your network connectivity and try again.",
          variant: "destructive",
        });
        return;
      }

      // Update local global auth states context safely
      setUser({
        ...user,
        name: updatedUser.name || user.name,
        bio: updatedUser.bio || user.bio,
        image_url: updatedUser.image_url || user.image_url,
      });

      await refetchCurrentUser();
      
      toast({
        title: "Success!",
        description: "Profile signatures updated successfully.",
      });
      
      router.push(`/profile/${id}`);
    } catch (error) {
      console.error("Critical Profile Update Failure:", error);
      toast({
        title: "An unexpected error occurred.",
        description: "Failed to apply user profile updates.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-1 min-h-screen bg-dark-1 pb-12">
      <div className="common-container pb-32 md:pb-12 px-4 max-w-5xl mx-auto w-full">
        {/* Component Dashboard Header Row */}
        <div className="flex items-center gap-3 justify-start w-full mb-8 pt-4">
          <img
            src="/assets/icons/edit.svg"
            width={32}
            height={32}
            alt="Edit operational form layout title vector icon badge"
            className="invert-white opacity-90"
          />
          <h2 className="h3-bold md:h2-bold text-left text-light-1 tracking-tight">Edit Profile</h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="flex flex-col gap-6 w-full mt-4"
          >
            {/* Interactive Image Profile Uploader Field Grid */}
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormControl>
                    <ProfileUploader
                      fieldChange={field.onChange}
                      mediaUrl={currentUser.image_url}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message text-red" />
                </FormItem>
              )}
            />

            {/* Public Account Profile Name Input */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label text-light-2 font-medium">Name</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input bg-dark-3 border-dark-4 text-light-1" {...field} />
                  </FormControl>
                  <FormMessage className="text-red" />
                </FormItem>
              )}
            />

            {/* Read-Only Locked Handle Identifier String Form Entry Row */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="opacity-60 cursor-not-allowed">
                  <FormLabel className="shad-form_label text-light-3 font-medium">Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input bg-dark-4 border-dark-4 text-light-3 cursor-not-allowed select-none"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage className="text-red" />
                </FormItem>
              )}
            />

            {/* Read-Only Core Identity Email Form Row Section */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="opacity-60 cursor-not-allowed">
                  <FormLabel className="shad-form_label text-light-3 font-medium">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input bg-dark-4 border-dark-4 text-light-3 cursor-not-allowed select-none"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage className="text-red" />
                </FormItem>
              )}
            />

            {/* Account Description Bio Text Area Segment Input Container */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label text-light-2 font-medium">Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      className="shad-textarea custom-scrollbar bg-dark-3 border-dark-4 text-light-1 min-h-[110px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message text-red" />
                </FormItem>
              )}
            />

            {/* Navigation Cancellation and Submission Matrix Control Node Row */}
            <div className="flex gap-4 items-center justify-end pt-4 mobile-bottom-spacing">
              <Button
                type="button"
                className="shad-button_dark_4 bg-dark-4 hover:bg-dark-3 text-light-1 px-6 h-11 rounded-lg transition-colors"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="shad-button_primary bg-primary-500 hover:bg-primary-600 text-light-1 px-6 h-11 rounded-lg flex items-center justify-center gap-2 transition-all font-medium disabled:opacity-50"
                disabled={isLoadingUpdate}
              >
                {isLoadingUpdate && <Loader />}
                <span>Update Profile</span>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateProfileWrapper;