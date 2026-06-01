"use client";

import { useState } from "react";
import { useSearchUsers } from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import { Link } from "react-router-dom"; // Or 'next/link' depending on your setup

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: users, isLoading } = useSearchUsers(searchTerm, 10);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Search Panel */}
      <div className="relative w-[400px] h-full bg-dark-1 border-r border-dark-4 p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-light-1">Search</h2>
          <button onClick={onClose} className="text-light-4 hover:text-white">✕</button>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search name or username..."
          className="w-full bg-dark-3 py-3 px-4 rounded-xl border border-dark-4 text-light-1 focus:outline-none focus:border-primary-500"
          autoFocus
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Results Area */}
        <div className="mt-8 overflow-y-auto max-h-[calc(100vh-150px)]">
          {isLoading ? (
            <Loader />
          ) : searchTerm && users?.length === 0 ? (
            <p className="text-light-4 text-sm text-center mt-10">No users found.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {users?.map((user: any) => (
                <li key={user.id}>
                  <a 
                    href={`/profile/${user.id}`} 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-3 transition"
                    onClick={onClose}
                  >
                    <img src={user.image_url} className="w-10 h-10 rounded-full object-cover" alt={user.username} />
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-white">{user.name}</p>
                      <p className="text-xs text-light-3">@{user.username}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;