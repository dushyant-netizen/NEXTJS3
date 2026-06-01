"use client";

import React from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";

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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PRIVACY_SETTINGS } from "@/constants";

import { ProfileValidation } from "@/lib/validation";
import { useUserContext } from "@/context/SupabaseAuthContext";
import { useGetUserById, useUpdateUser, useGetCurrentUser } from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import ProfileUploader from "@/components/shared/ProfileUploder";

const UpdateProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, setUser } = useUserContext();
  
  const userId = Array.isArray(id) ? id[0] : id;
  
  // Queries
  const { data: currentUser, isPending: isLoadingUser } = useGetUserById(userId || "");
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
      privacy_setting: "public",
    },
  });

  // 💡 OPTIMIZATION: Keep form states tightly synched with remote server state on query completion
  React.useEffect(() => {
    if (currentUser) {
      form.reset({
        file: [],
        name: currentUser.name || "",
        username: currentUser.username || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
        privacy_setting: currentUser.privacy_setting || "public",
      });
    }
  }, [currentUser, form]);

  if (isLoadingUser || !currentUser) {
    return (
      <div className="flex justify-center items-center w-full h-[60vh]">
        <Loader />
      </div>
    );
  }

  const handleUpdate = async (value: z.infer<typeof ProfileValidation>) => {
    // 🛡️ SECURITY GUARD: Block mutation processing requests if authentication context states drop out mid-session
    if (!user || user.id !== currentUser.id) {
      toast({
        title: "Action unauthorized.",
        description: "You do not possess security access permissions to alter this account setup profile.",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedUser = await updateUser({
        userId: currentUser.id,
        name: value.name,
        username: value.username,
        email: value.email,
        bio: value.bio,
        privacy_setting: value.privacy_setting,
        file: value.file,
        imageUrl: currentUser.image_url,
      });

      if (!updatedUser) {
        toast({
          title: "Update user profile failed.",
          description: "Could not apply properties change safely to database records. Try again.",
          variant: "destructive"
        });
        return;
      }

      setUser({
        ...user,
        name: updatedUser.name || user.name,
        username: updatedUser.username || user.username,
        email: updatedUser.email || user.email,
        bio: updatedUser.bio || user.bio,
        privacy_setting: updatedUser.privacy_setting || user.privacy_setting,
        image_url: updatedUser.image_url || user.image_url,
      });
      
      await refetchCurrentUser();
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      
      navigate(`/profile/${userId}`);
    } catch (error) {
      console.error("Error updating profile signature:", error);
      toast({
        title: "An unexpected error occurred.",
        description: "Failed to communicate with remote database instance.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-1 min-h-screen bg-dark-1 pb-12">
      <div className="common-container md:pt-12 px-4 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 justify-start w-full mb-8">
          <img
            src="/assets/icons/edit.svg"
            width={32}
            height={32}
            alt="Edit form action layout decoration badge"
            className="invert-white opacity-90"
          />
          <h2 className="h3-bold md:h2-bold text-left text-light-1 tracking-tight">Edit Profile</h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="flex flex-col gap-6 w-full mt-4"
          >
            {/* Avatar Profile Uploader Channel field row */}
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
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            {/* Account Display Name Inputs field row */}
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

            {/* Locked Unique Username field display layout */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="opacity-60 cursor-not-allowed">
                  <FormLabel className="shad-form_label text-light-3 font-medium">Username (Unique handle identifier)</FormLabel>
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

            {/* Secure Account Email field layout entry points */}
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

            {/* Custom Interactive User Bio Segment textarea */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label text-light-2 font-medium">Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      className="shad-textarea custom-scrollbar bg-dark-3 border-dark-4 text-light-1 min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message text-red" />
                </FormItem>
              )}
            />

            {/* Account Privacy Global Permissions level routing drop selectors */}
            <FormField
              control={form.control}
              name="privacy_setting"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label text-light-2 font-medium">Privacy Setting</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="shad-input bg-dark-3 border-dark-4 text-light-1 h-12 focus:ring-1 focus:ring-primary-500">
                        <SelectValue placeholder="Select account global context tracking privacy level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-dark-2 border border-dark-4 text-light-1">
                      {PRIVACY_SETTINGS.map((setting) => (
                        <SelectItem 
                          key={setting.value} 
                          value={setting.value}
                          className="hover:bg-dark-3 focus:bg-dark-3 cursor-pointer py-3 transition-colors"
                        >
                          <div className="flex flex-col text-left">
                            <span className="font-semibold text-sm text-light-1">{setting.label}</span>
                            <span className="text-xs text-light-3 mt-0.5">{setting.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="shad-form_message text-red" />
                </FormItem>
              )}
            />

            {/* Functional action control operation panel elements buttons matrix */}
            <div className="flex gap-4 items-center justify-end mt-4 mobile-bottom-spacing">
              <Button
                type="button"
                className="shad-button_dark_4 bg-dark-4 hover:bg-dark-3 text-light-1 px-6 h-11 rounded-lg transition-colors"
                onClick={() => navigate(-1)}
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

export default UpdateProfile;