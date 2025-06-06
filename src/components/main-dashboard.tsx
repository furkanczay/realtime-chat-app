"use client";

import { socket } from "@/lib/socket-client";
import FriendsList from "./friends-list";
import AllFriendsList from "./all-friends-list";
import UserSearch from "./user-search";
import PrivateChat from "./private-chat";
import NotificationToast from "./notification-toast";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  MessageCircle,
  Users,
  UserPlus,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { Session } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface MainDashboardProps {
  user: Session;
}

export default function MainDashboard({ user }: MainDashboardProps) {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"messages" | "contacts">(
    "messages"
  );
  const [refreshFriends, setRefreshFriends] = useState(0);
  const {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    requestPermission,
  } = useNotifications();
  const currentUser: User = {
    id: user.user.id,
    name: user.user.name || "",
    email: user.user.email || "",
  };

  const handleRefreshFriends = () => {
    setRefreshFriends((prev) => prev + 1);
  };

  useEffect(() => {
    // Bildirim izni iste
    requestPermission();

    // Kullanıcı odasına katıl
    socket.emit("join_user", { userId: user.user.id }); // Socket event listener'ları
    const handleMessageNotification = (data: any) => {
      // Aktif sohbet edilen kullanıcıdan gelen mesaj değilse bildirim göster
      if (!selectedUser || selectedUser.id !== data.data.senderId) {
        addNotification(data);
        // Arkadaş listesini yenile (okunmamış mesaj sayısını güncellemek için)
        handleRefreshFriends();
      }
    };

    const handleFriendRequestNotification = (data: any) => {
      addNotification(data);
    };

    const handleFriendAcceptedNotification = (data: any) => {
      addNotification(data);
    };

    socket.on("messageNotification", handleMessageNotification);
    socket.on("friendRequestNotification", handleFriendRequestNotification);
    socket.on("friendAcceptedNotification", handleFriendAcceptedNotification);

    return () => {
      socket.off("privateMessage");
      socket.off("messageError");
      socket.off("messageNotification", handleMessageNotification);
      socket.off("friendRequestNotification", handleFriendRequestNotification);
      socket.off(
        "friendAcceptedNotification",
        handleFriendAcceptedNotification
      );
    };
  }, [user.user.id, selectedUser, addNotification, requestPermission]);
  const handleSelectUser = (friend: User) => {
    setSelectedUser(friend);
    // Arkadaş seçildiğinde listeyi yenile (okunmamış mesaj sayılarını güncellemek için)
    setTimeout(() => {
      handleRefreshFriends();
    }, 500); // Kısa bir gecikme ile API çağrısının tamamlanmasını bekle
  };
  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sol Sidebar - WhatsApp Web benzeri */}
      <div className="w-16 bg-gray-800 flex flex-col items-center py-4">
        {/* Ana Navigation */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Mesajlar Tab */}
          <div className="relative group">
            <button
              onClick={() => setActiveTab("messages")}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                activeTab === "messages"
                  ? "bg-green-500 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              title="Mesajlar"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              Mesajlar
            </div>
          </div>

          {/* Kişiler Tab */}
          <div className="relative group">
            <button
              onClick={() => setActiveTab("contacts")}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                activeTab === "contacts"
                  ? "bg-green-500 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              title="Kişiler"
            >
              <Users className="h-5 w-5" />
            </button>
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              Kişiler
            </div>
          </div>
        </div>

        {/* Alt Kısım - Profil ve Ayarlar */}
        <div className="mt-auto flex flex-col gap-4">
          {/* Bildirimler */}
          <div className="relative group">
            <button
              className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200 relative"
              title="Bildirimler"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </button>
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              Bildirimler
            </div>
          </div>{" "}
          {/* Ayarlar */}
          <div className="relative group">
            <button
              onClick={() => router.push("/settings")}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200"
              title="Ayarlar"
            >
              <Settings className="h-5 w-5" />
            </button>
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              Ayarlar
            </div>
          </div>
          {/* Profil Avatar */}
          <div className="relative group">
            <button
              className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200"
              title={user.user.name || "Profil"}
            >
              {user.user.name.charAt(0).toUpperCase()}
            </button>
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              {user.user.name}
            </div>
          </div>
        </div>
      </div>

      {/* Orta Panel - Arkadaş Listesi */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-gray-900">
              {activeTab === "messages" ? "Mesajlar" : "Kişiler"}
            </h1>
            {activeTab === "contacts" && <UserSearch />}
          </div>
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "messages" ? (
            <FriendsList
              key={refreshFriends}
              onSelectUser={handleSelectUser}
              selectedUserId={selectedUser?.id}
              onRefresh={handleRefreshFriends}
            />
          ) : (
            <div className="flex-1 overflow-hidden">
              <AllFriendsList
                onSelectUser={handleSelectUser}
                selectedUserId={selectedUser?.id}
              />
            </div>
          )}
        </div>
      </div>

      {/* Ana Chat Alanı */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <PrivateChat currentUser={currentUser} selectedUser={selectedUser} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageCircle className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                WhatsApp Web Benzeri Mesajlaşma
              </h3>
              <p className="text-gray-500 max-w-md">
                Sol taraftan bir konuşma seçin ve güvenli mesajlaşmaya başlayın
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-400">
                <span>🔒</span>
                <span>Uçtan uca şifrelenmiş</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bildirim Toast'ları */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <NotificationToast
          notifications={notifications}
          onRemove={removeNotification}
          onMarkAsRead={markAsRead}
        />
      </div>
    </div>
  );
}
