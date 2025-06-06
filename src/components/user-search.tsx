"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Search, UserPlus, Check, X, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { socket } from "@/lib/socket-client";

interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
}

interface FriendRequest {
  id: number;
  sender: User;
  receiver: User;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

export default function UserSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [open, setOpen] = useState(false);

  const searchUsers = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(searchTerm)}`
      );
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error("Kullanıcı arama hatası:", error);
    } finally {
      setLoading(false);
    }
  };
  const sendFriendRequest = async (userId: number) => {
    try {
      const response = await fetch("/api/friend-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverId: userId }),
      });

      if (response.ok) {
        const data = await response.json();

        // Socket event emit et - arkadaş isteği gönderildi bildirimi
        if (data.success && data.data) {
          const targetUser = searchResults.find((user) => user.id === userId);
          socket.emit("friendRequestSent", {
            requestId: data.data.id,
            senderId: data.data.senderId,
            senderUsername: data.data.sender.username,
            receiverId: userId,
          });
        } // Arama sonuçlarından kullanıcıyı kaldır ve dialog'u kapat
        setSearchResults((prev) => prev.filter((user) => user.id !== userId));
        setOpen(false);
        setSearchTerm("");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Arkadaşlık isteği gönderme hatası:", error);
    }
  };
  const handleFriendRequest = async (
    requestId: number,
    action: "accept" | "reject"
  ) => {
    try {
      const response = await fetch(`/api/friend-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const data = await response.json();

        // Arkadaş isteği kabul edildiyse socket event emit et
        if (action === "accept" && data.success) {
          const request = friendRequests.find((req) => req.id === requestId);
          if (request) {
            socket.emit("friendRequestAccepted", {
              senderId: request.sender.id,
              accepterId: request.receiver.id,
              accepterUsername: request.receiver.username,
            });
          }
        }

        setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
      }
    } catch (error) {
      console.error("Arkadaşlık isteği yanıtlama hatası:", error);
    }
  };
  const loadFriendRequests = async () => {
    try {
      const response = await fetch("/api/friend-requests");
      const data = await response.json();
      if (data.success) {
        setFriendRequests(data.data);
      }
    } catch (error) {
      console.error("Arkadaşlık istekleri yükleme hatası:", error);
    }
  };

  useEffect(() => {
    loadFriendRequests();
  }, []);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Arkadaş Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Arkadaş Ekle</DialogTitle>
          <DialogDescription>
            Kullanıcı adı veya email ile arama yaparak yeni arkadaşlar ekleyin
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Arama Çubuğu */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Kullanıcı adı veya email ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchUsers()}
                className="pl-10"
              />
            </div>
            <Button
              onClick={searchUsers}
              disabled={loading}
              size="sm"
              className="bg-green-500 hover:bg-green-600"
            >
              {loading ? "Arıyor..." : "Ara"}
            </Button>
          </div>{" "}
          <div className="flex-1 overflow-y-auto max-h-80">
            {/* Arkadaşlık İstekleri */}
            {friendRequests.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Arkadaşlık İstekleri ({friendRequests.length})
                </h3>
                <div className="space-y-2">
                  {friendRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white font-semibold">
                          {request.sender.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                          {request.sender.username}
                        </h4>
                        <p className="text-xs text-gray-600">
                          Arkadaşlık isteği gönderdi
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleFriendRequest(request.id, "accept")
                          }
                          className="bg-green-500 hover:bg-green-600 text-white h-8 px-2"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleFriendRequest(request.id, "reject")
                          }
                          className="text-red-600 border-red-200 hover:bg-red-50 h-8 px-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Arama Sonuçları */}
            {searchResults.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Arama Sonuçları ({searchResults.length})
                </h3>
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white font-semibold">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                          {user.username}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => sendFriendRequest(user.id)}
                        className="bg-green-500 hover:bg-green-600 text-white h-8 px-3"
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Ekle
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Boş Durum */}
            {searchResults.length === 0 &&
              friendRequests.length === 0 &&
              !loading && (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <UserPlus className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      Yeni Arkadaşlar Bul
                    </h3>
                    <p className="text-gray-500 text-xs">
                      Kullanıcı adı veya email ile arama yapın
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
