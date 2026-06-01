"use client";
// ADD THIS LINE at the very top of your file
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef,useMemo } from "react";
import { useUserContext } from "@/context/SupabaseAuthContext";
import {
  useGetRooms,
  useGetMessages,
  useSendMessage,
  useGetFollowing,
  useCreateRoom,
  useDeleteMessage,
  useClearChat, // Add this import
} from "@/lib/react-query/queriesAndMutations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Loader from "@/components/shared/Loader";
import { Send, Plus, Smile,MoreVertical } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const ChatPage = () => {

  // Change line 28 to this:
  const [_isCreating, _setIsCreating] = useState(false);
  const { mutateAsync: deleteMsg } = useDeleteMessage();
  const [isUploading, setIsUploading] = useState(false);
  const { mutateAsync: clearChat } = useClearChat();
  const { user } = useUserContext();
  if (!user) {
    return <Loader />;
  }
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const supabase = useMemo(() => createClient(), []);

  const { data: rooms, isLoading: isRoomsLoading } = useGetRooms(
    user?.id || "",
  );
  const { data: messages, isLoading: isMessagesLoading } = useGetMessages(
    selectedRoom?.id || "",
  );
  const { data: following, isLoading: isFollowingLoading } = useGetFollowing(
    user?.id || "",
  );
  const { mutateAsync: sendMsg } = useSendMessage();
  const { mutateAsync: createRoom } = useCreateRoom();

  const [showPicker, setShowPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !selectedRoom?.id || !user?.id) return;

  setIsUploading(true); // 1. Start loading
  
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `chat/${selectedRoom.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('chats')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('chats')
      .getPublicUrl(filePath);

    await sendMsg({
      roomId: selectedRoom.id,
      senderId: user.id,
      content: publicUrlData.publicUrl,
    });

    console.log("File uploaded and message sent!");
  } catch (error) {
    console.error("Error uploading file:", error);
    alert("Upload failed. Please try again."); // Feedback for user
  } finally {
    setIsUploading(false); // 2. Stop loading (always runs)
    e.target.value = ''; // 3. Reset input so the same file can be selected again
  }
};

  const handleEmojiClick = (emojiData: any) => {
    // Appends the emoji to the input value
    if (inputRef.current) {
      inputRef.current.value += emojiData.emoji;
    }
    setShowPicker(false);
  };
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); // Scrolls whenever messages array changes
  useEffect(() => {
    if (!selectedRoom?.id) return;
  
    const channel = supabase
      .channel("realtime messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${selectedRoom.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", selectedRoom.id] });
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoom?.id, supabase, queryClient]);


  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const content = new FormData(form).get("message") as string;

    // The critical check
    console.log("Checking data before send:", {
      room: selectedRoom?.id,
      user: user?.id,
      content: content?.trim(),
    });

    if (!selectedRoom?.id) {
      alert("Chat room not ready! Please wait a second.");
      return;
    }

    if (!user?.id || !content?.trim()) return;

    await sendMsg({
      roomId: selectedRoom.id,
      senderId: user.id,
      content,
    });

    form.reset();
  };

  return (

    <div className="flex w-full h-screen bg-dark-1 text-light-1 overflow-hidden">
      {/* 1. LEFT SIDEBAR: Conversations List */}
      {/* Changed w-[350px] to w-[280px] to reduce width */}
      <aside className="w-[280px] border-r border-dark-4 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-dark-4">
          <h2 className="text-xl font-bold truncate">
            {user?.username || "Messages"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Existing Rooms Section */}
          <div className="p-4 text-xs font-bold text-light-4 uppercase">
            Chats
          </div>
          {isRoomsLoading ? (
            <Loader />
          ) : (
            rooms?.map((room: any) => (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`flex items-center gap-3 p-4 hover:bg-dark-3 cursor-pointer ${selectedRoom?.id === room.id ? "bg-dark-3" : ""}`}
              >
                <div className="w-10 h-10 rounded-full bg-dark-4 flex-shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold text-sm truncate">
                    {room.name || "Username"}
                  </p>
                  <p className="text-xs text-light-4 truncate">
                    {room.messages?.[0]?.content || "No messages"}
                  </p>
                </div>
              </div>
            ))
          )}

          {/* Following Section */}
          <div className="p-4 text-xs font-bold text-light-4 uppercase border-t border-dark-4 mt-2">
            Following
          </div>
          {isFollowingLoading ? (
            <Loader />
          ) : (
            following?.map((f: any) => (
              <div
                key={f.id}
                // Inside your Following map()
                onClick={async () => {
                  setIsCreating(true); // 1. Set a loading state
                  const existingRoom = rooms?.find((r: any) =>
                    r.participants?.includes(f.id),
                  );

                  if (existingRoom) {
                    setSelectedRoom(existingRoom);
                  } else {
                    const newRoom = await createRoom([user.id, f.id]);
                    if (newRoom && newRoom.length > 0) {
                      setSelectedRoom(newRoom[0]); // 2. Room is set here
                    }
                  }
                  setIsCreating(false); // 3. Done
                }}
                className="flex items-center gap-3 p-4 hover:bg-dark-3 cursor-pointer"
              >
                <img
                  src={f.imageUrl}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                <p className="font-semibold text-sm truncate">{f.username}</p>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* 2. RIGHT CONTENT: Active Chat Window */}
<main className="flex-1 flex flex-col bg-dark-1">
  {selectedRoom ? (
    <>
     {/* REPLACE THE OLD HEADER DIV WITH THIS: */}
     <header className="p-4 border-b border-dark-4 flex justify-between items-center">
        <h2 className="font-bold text-white">{selectedRoom.name}</h2>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="p-2 text-light-4 hover:text-white rounded-md">
            <MoreVertical size={20} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-dark-3 border-dark-4 text-white">
            <DropdownMenuItem className="cursor-pointer hover:bg-dark-2">View Info</DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-500 cursor-pointer hover:bg-red-500/10"
              onClick={async () => {
                if (confirm("Are you sure? This will delete all messages in this chat.")) {
                  await clearChat(selectedRoom.id);
                }
              }}
            >
              Clear Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
<div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
  {isMessagesLoading ? (
    <Loader />
  ) : (
    messages?.map((msg: any) => (
      <div 
        key={msg.id} 
        className={`group relative flex flex-col ${msg.sender_id === user?.id ? "items-end" : "items-start"}`}
      >
        <div className={`p-3 rounded-xl max-w-xs ${
          msg.sender_id === user?.id ? "bg-primary-500" : "bg-dark-3"
        }`}>
          {msg.content.startsWith("http") ? (
            <img
              src={msg.content}
              alt="attachment"
              className="max-w-[200px] rounded-lg cursor-pointer"
              onClick={() => window.open(msg.content, "_blank")}
            />
          ) : (
            msg.content
          )}
        </div>

        {/* Delete Button */}
        {msg.sender_id === user?.id && (
          <button
            onClick={async () => {
              if (confirm("Delete this message?")) {
                await deleteMsg(msg.id);
              }
            }}
            className="hidden group-hover:block text-red-500 text-[10px] mt-1 hover:underline"
          >
            Delete
          </button>
        )}
      </div>
    ))
  )}

  {/* THIS IS THE CRITICAL ANCHOR DIV - IT MUST STAY HERE */}
  <div ref={messagesEndRef} />
</div>

      <form onSubmit={handleSendMessage} className="p-4 flex items-center gap-3">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className={`text-light-1 ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isUploading ? <Loader /> : <Plus size={24} />}
        </button>

        <div className="flex-1 bg-dark-3 rounded-full px-4 py-2.5 flex items-center relative">
          <input
            name="message"
            ref={inputRef}
            className="flex-1 bg-transparent outline-none text-sm text-white"
            placeholder="Message..."
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="text-light-4 ml-2 hover:text-light-1"
          >
            <Smile size={20} />
          </button>
          {showPicker && (
            <div className="absolute bottom-12 right-0 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>

        <button type="submit" className="text-primary-500 font-bold p-2">
          <Send size={20} />
        </button>
      </form>
    </>
  ) : (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="w-20 h-20 border border-light-4 rounded-full flex items-center justify-center mb-4">
        <span className="text-4xl">✉️</span>
      </div>
      <h3 className="text-xl font-medium">Your messages</h3>
      <p className="text-sm text-light-4 mt-1">Send a message to start a chat.</p>
    </div>
  )}
</main>
    </div>
  );
};

export default ChatPage;
