"use client";

import { Avatar, AvatarFallback } from "./ui/avatar";
import { User, Search, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket-client";

interface Friend {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface AllFriendsListProps {
  onSelectUser: (user: Friend) => void;
  selectedUserId?: number;
}

export default function AllFriendsList({
  onSelectUser,
  selectedUserId,
}: AllFriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    fetchFriends();

    // Socket event listener'ları ekle
    const handleUserStatusChange = (data: {
      userId: number;
      isOnline: boolean;
      lastSeen: Date;
    }) => {
      setFriends((prevFriends) =>
        prevFriends.map((friend) =>
          friend.id === data.userId
            ? {
                ...friend,
                isOnline: data.isOnline,
                lastSeen: data.lastSeen.toString(),
              }
            : friend
        )
      );
    };

    socket.on("userStatusChange", handleUserStatusChange);

    return () => {
      socket.off("userStatusChange", handleUserStatusChange);
    };
  }, []);

  const fetchFriends = async () => {
    try {
      // Tüm arkadaşları getir
      const response = await fetch("/api/friends");
      const data = await response.json();
      if (data.success) {
        setFriends(data.data);
      }
    } catch (error) {
      console.error("Arkadaşlar yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="p-4">
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-100 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Arama Çubuğu */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Arkadaş ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Arkadaş Listesi */}
      <div className="flex-1 overflow-y-auto">
        {filteredFriends.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                {searchTerm
                  ? "Arama sonucu bulunamadı"
                  : "Henüz arkadaşınız yok"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 ${
                  selectedUserId === friend.id
                    ? "bg-green-50 border-r-4 border-r-green-500"
                    : ""
                }`}
                onClick={() => onSelectUser(friend)}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white font-semibold">
                      {friend.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {friend.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {friend.username}
                    </h3>
                    <MessageCircle className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {friend.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
