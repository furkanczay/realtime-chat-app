"use client";

import { socket } from "@/lib/socket-client";
import {
  encryptMessage,
  decryptMessage,
  generateRoomKey,
} from "@/lib/encryption";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Send,
  MessageCircle,
  Shield,
  ShieldCheck,
  Check,
  CheckCheck,
} from "lucide-react";
import React, { FormEvent, useEffect, useState, useRef, useMemo } from "react";

// Yardımcı fonksiyon: Son görülme zamanını formatla
const formatLastSeen = (lastSeen: string) => {
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffInMinutes = Math.floor(
    (now.getTime() - lastSeenDate.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) {
    return "Şimdi";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} dakika önce`;
  } else if (diffInMinutes < 1440) {
    // 24 saat
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} saat önce`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    if (days === 1) {
      return "Dün";
    } else if (days < 7) {
      return `${days} gün önce`;
    } else {
      return lastSeenDate.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
      });
    }
  }
};

interface Message {
  id: number;
  text: string;
  createdAt: string;
  isRead?: boolean;
  sender: {
    id: number;
    username: string;
    email: string;
  };
  receiver: {
    id: number;
    username: string;
    email: string;
  };
}

interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface PrivateChatProps {
  currentUser: User;
  selectedUser: User;
}

export default function PrivateChat({
  currentUser,
  selectedUser: initialSelectedUser,
}: PrivateChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User>(initialSelectedUser);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Şifreleme anahtarını oluştur - useMemo ile optimize et
  const roomKey = useMemo(
    () => generateRoomKey(currentUser.id, selectedUser.id),
    [currentUser.id, selectedUser.id]
  );

  // Props'tan gelen selectedUser değişikliklerini takip et
  useEffect(() => {
    setSelectedUser(initialSelectedUser);
  }, [initialSelectedUser]);
  useEffect(() => {
    if (selectedUser) {
      // Reset typing state when switching users
      setIsTyping(false);
      setTypingUser("");

      loadConversation(); // Socket event listeners
      const handlePrivateMessage = (data: Message) => {
        // Sadece bu konuşmaya ait mesajları ekle
        if (
          (data.sender.id === currentUser.id &&
            data.receiver.id === selectedUser.id) ||
          (data.sender.id === selectedUser.id &&
            data.receiver.id === currentUser.id)
        ) {
          // Mesajı şifresini çözerek ekle
          const decryptedMessage = {
            ...data,
            text: decryptMessage(data.text, roomKey),
          };
          setMessages((prev) => {
            // Aynı mesajın tekrar eklenmesini önle
            const exists = prev.find((msg) => msg.id === data.id);
            if (exists) return prev;
            return [...prev, decryptedMessage];
          });

          // Eğer mesaj bu kullanıcıdan geliyorsa otomatik olarak okundu işaretle
          if (data.sender.id === selectedUser.id) {
            markMessagesAsRead();
          }
        }
      };
      const handleTyping = (data: {
        userId: number;
        username: string;
        isTyping: boolean;
      }) => {
        // Gelen yazıyor bilgisi seçili kullanıcıdan geliyorsa göster
        if (data.userId === selectedUser.id) {
          setIsTyping(data.isTyping);
          if (data.isTyping) {
            setTypingUser(data.username);
          } else {
            setTypingUser("");
          }
        }
      };
      const handleMessagesRead = (data: { receiverId: number }) => {
        console.log("Mesajların okunduğu bildirimi geldi:", data);
        // Bu kullanıcıya gönderilen mesajları okundu olarak işaretle
        setMessages((prev) =>
          prev.map((msg) => {
            if (
              msg.sender.id === currentUser.id &&
              msg.receiver.id === data.receiverId
            ) {
              console.log("Mesaj okundu olarak işaretlendi:", msg.id);
              return { ...msg, isRead: true };
            }
            return msg;
          })
        );
      };

      const handleUserStatusChange = (data: {
        userId: number;
        isOnline: boolean;
        lastSeen: Date;
      }) => {
        // Seçili kullanıcının durumu değiştiyse güncelle
        if (data.userId === selectedUser.id) {
          setSelectedUser((prev) => ({
            ...prev,
            isOnline: data.isOnline,
            lastSeen: data.lastSeen.toString(),
          }));
        }
      };

      socket.on("privateMessage", handlePrivateMessage);
      socket.on("userTyping", handleTyping);
      socket.on("messagesMarkedAsRead", handleMessagesRead);
      socket.on("userStatusChange", handleUserStatusChange);

      return () => {
        socket.off("privateMessage", handlePrivateMessage);
        socket.off("userTyping", handleTyping);
        socket.off("messagesMarkedAsRead", handleMessagesRead);
        socket.off("userStatusChange", handleUserStatusChange);
      };
    }
  }, [selectedUser.id, currentUser.id, roomKey, initialSelectedUser]); // initialSelectedUser'ı dependency'ye ekle

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const loadConversation = async () => {
    setLoading(true);
    setMessages([]); // Önceki mesajları temizle
    try {
      const response = await fetch(`/api/messages/${selectedUser.id}`);
      const data = await response.json();
      if (data.success) {
        // Mesajları şifresini çözerek yükle
        const decryptedMessages = data.data.map((message: Message) => ({
          ...message,
          text: decryptMessage(message.text, roomKey),
        }));
        setMessages(decryptedMessages);

        // Bu kullanıcıdan gelen okunmamış mesajlar var mı kontrol et
        const hasUnreadFromSelectedUser = data.data.some(
          (msg: Message) => msg.sender.id === selectedUser.id && !msg.isRead
        );

        // Eğer okunmamış mesajlar varsa, okundu işaretle ve socket event gönder
        if (hasUnreadFromSelectedUser) {
          await markMessagesAsRead();
        }
      }
    } catch (error) {
      console.error("Konuşma yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };
  const markMessagesAsRead = async () => {
    try {
      await fetch(`/api/messages/${selectedUser.id}/read`, {
        method: "POST",
      });

      console.log("Okundu bildirimi gönderiliyor:", {
        senderId: selectedUser.id,
        receiverId: currentUser.id,
      });

      // Socket ile diğer kullanıcıya bildir
      socket.emit("messagesRead", {
        senderId: selectedUser.id,
        receiverId: currentUser.id,
      });
    } catch (error) {
      console.error("Mesajları okundu işaretleme hatası:", error);
    }
  };
  const sendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const messageText = formData.get("message") as string;

    if (!messageText.trim()) return;

    // Yazıyor durumunu sıfırla
    handleTypingStop();

    // Mesajı şifrele
    const encryptedText = encryptMessage(messageText, roomKey);

    const messageData = {
      text: encryptedText, // Şifrelenmiş mesajı gönder
      receiverId: selectedUser.id,
      sender: currentUser,
      receiver: selectedUser,
    };

    socket.emit("privateMessage", messageData);
    form.reset();
  };
  const handleTypingStart = () => {
    socket.emit("typing", {
      receiverId: selectedUser.id,
      senderId: currentUser.id,
      senderUsername: currentUser.username,
      isTyping: true,
    });

    // Mevcut timeout'u temizle
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // 3 saniye sonra yazıyor durumunu durdur
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 3000);
  };

  const handleTypingStop = () => {
    socket.emit("typing", {
      receiverId: selectedUser.id,
      senderId: currentUser.id,
      senderUsername: currentUser.username,
      isTyping: false,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };
  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        {/* Loading Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-100 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-100 rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-100 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Loading Messages */}
        <div className="flex-1 bg-gray-50 p-4 space-y-4">
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full animate-pulse"></div>
            <p className="text-gray-500">Mesajlar yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col bg-white">
      {" "}
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white font-semibold">
                {selectedUser.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {selectedUser.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">
              {selectedUser.username}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {selectedUser.isOnline ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Çevrimiçi</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span>
                    {selectedUser.lastSeen
                      ? `Son görülme: ${formatLastSeen(selectedUser.lastSeen)}`
                      : "Çevrimdışı"}
                  </span>
                </>
              )}
              <span>•</span>
              <ShieldCheck className="h-3 w-3 text-green-500" />
              <span className="text-green-600">Şifrelenmiş</span>
            </div>
          </div>
        </div>
      </div>
      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-3"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f0f0f0" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageCircle className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Güvenli mesajlaşmaya başla
              </h3>
              <p className="text-gray-500 text-sm">
                {selectedUser.username} ile olan mesajların uçtan uca şifrelenir
              </p>
            </div>{" "}
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message, index) => {
              const isOwnMessage = message.sender.id === currentUser.id;
              const nextMessage = messages[index + 1];
              const prevMessage = messages[index - 1];

              // Mesaj gruplandırma mantığı
              const isNextFromSameSender =
                nextMessage && nextMessage.sender.id === message.sender.id;
              const isPrevFromSameSender =
                prevMessage && prevMessage.sender.id === message.sender.id;

              // 5 dakikadan az zaman farkı varsa grupla
              const timeDiff = nextMessage
                ? (new Date(nextMessage.createdAt).getTime() -
                    new Date(message.createdAt).getTime()) /
                  (1000 * 60)
                : Infinity;
              const shouldGroupWithNext = isNextFromSameSender && timeDiff < 5;

              const prevTimeDiff = prevMessage
                ? (new Date(message.createdAt).getTime() -
                    new Date(prevMessage.createdAt).getTime()) /
                  (1000 * 60)
                : Infinity;
              const isGroupedWithPrev =
                isPrevFromSameSender && prevTimeDiff < 5;

              // Mesaj köşe radius belirleme
              const getBorderRadius = () => {
                if (isOwnMessage) {
                  if (shouldGroupWithNext && isGroupedWithPrev)
                    return "rounded-2xl rounded-tr-lg rounded-br-lg";
                  if (shouldGroupWithNext) return "rounded-2xl rounded-br-lg";
                  if (isGroupedWithPrev) return "rounded-2xl rounded-tr-lg";
                  return "rounded-2xl";
                } else {
                  if (shouldGroupWithNext && isGroupedWithPrev)
                    return "rounded-2xl rounded-tl-lg rounded-bl-lg";
                  if (shouldGroupWithNext) return "rounded-2xl rounded-bl-lg";
                  if (isGroupedWithPrev) return "rounded-2xl rounded-tl-lg";
                  return "rounded-2xl";
                }
              };

              return (
                <div key={message.id}>
                  <div
                    className={`flex items-end gap-2 ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    } ${isGroupedWithPrev ? "mt-0.5" : "mt-4"}`}
                  >
                    {/* Avatar sadece gelen mesajlarda ve grup olmayan son mesajda göster */}
                    {!isOwnMessage && (
                      <div
                        className={`flex-shrink-0 ${
                          !shouldGroupWithNext ? "mb-1" : "invisible"
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-semibold">
                            {message.sender.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}

                    <div
                      className={`relative max-w-[70%] ${
                        isOwnMessage ? "ml-12" : "mr-12"
                      }`}
                    >
                      {/* Kullanıcı adı sadece gelen mesajlarda ve ilk mesajda */}
                      {!isOwnMessage && !isGroupedWithPrev && (
                        <div className="mb-1 ml-3">
                          <span className="text-xs font-medium text-gray-500">
                            {message.sender.username}
                          </span>
                        </div>
                      )}

                      <div className="relative">
                        <div
                          className={`inline-block px-4 py-2 shadow-sm transition-all duration-200 hover:shadow-md ${getBorderRadius()} ${
                            isOwnMessage
                              ? "bg-[#dcf8c6] "
                              : "bg-white text-gray-900 border border-gray-100"
                          }`}
                        >
                          <div className="flex items-end gap-1">
                            {/* Mesaj içeriği */}
                            <p className="text-sm leading-relaxed break-words">
                              {message.text}
                            </p>

                            {/* Zaman ve durum bilgisi */}
                            <div
                              className={`flex items-center text-xs gap-1 ${
                                isOwnMessage
                                  ? "text-green-100"
                                  : "text-gray-400"
                              }`}
                            >
                              <span className="text-[9px] text-muted-foreground font-medium whitespace-nowrap">
                                {new Date(message.createdAt).toLocaleTimeString(
                                  "tr-TR",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                              {isOwnMessage && (
                                <div className="flex-shrink-0 ml-1">
                                  {message.isRead ? (
                                    <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5 text-green-200" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}{" "}
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start items-end gap-2 mt-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-semibold">
                {typingUser.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-medium">
                  {typingUser} yazıyor
                </span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>{" "}
      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Input
              type="text"
              name="message"
              placeholder={`${selectedUser.username}'e mesaj yaz...`}
              className="w-full pr-4 py-3 px-4 rounded-full border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-200 resize-none"
              autoComplete="off"
              onInput={handleTypingStart}
              onBlur={handleTypingStop}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            className="h-12 w-12 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>

        {/* Encryption Notice */}
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
          <Shield className="h-3 w-3" />
          <span>Uçtan uca şifrelenmiş mesajlar</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span>WhatsApp benzeri güvenlik</span>
        </div>
      </div>
    </div>
  );
}
