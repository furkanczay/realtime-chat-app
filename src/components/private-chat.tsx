"use client";

import { socket } from "@/lib/socket-client";
import {
  encryptMessage,
  decryptMessage,
  generateRoomKey,
} from "@/lib/encryption";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Send,
  MessageCircle,
  Shield,
  ShieldCheck,
  Check,
  CheckCheck,
  Eye,
  Type,
} from "lucide-react";
import React, { FormEvent, useEffect, useState, useRef, useMemo, Suspense } from "react";
import { Badge } from "./ui/badge";

// Dynamic imports for ES modules
const ReactMarkdown = React.lazy(() => import("react-markdown"));
const remarkGfm = React.lazy(() => import("remark-gfm").then(mod => ({ default: mod.default })));

// Markdown Component with dynamic loading
const MarkdownRenderer = ({ children }: { children: string }) => {
  const [ReactMarkdownComponent, setReactMarkdownComponent] = useState<any>(null);
  const [remarkGfmPlugin, setRemarkGfmPlugin] = useState<any>(null);

  useEffect(() => {
    const loadComponents = async () => {
      try {
        const [ReactMarkdownMod, remarkGfmMod] = await Promise.all([
          import("react-markdown"),
          import("remark-gfm")
        ]);
        setReactMarkdownComponent(() => ReactMarkdownMod.default);
        setRemarkGfmPlugin(() => remarkGfmMod.default);
      } catch (error) {
        console.error("Failed to load markdown components:", error);
      }
    };
    loadComponents();
  }, []);

  // Fallback basit markdown parser
  const parseMarkdownSimple = (text: string) => {
    let html = text
      // HTML escape
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Kod blokları
      .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="bg-gray-800 text-green-400 p-2 rounded text-xs overflow-x-auto my-1"><div class="text-xs text-gray-400 mb-1">$1</div><code>$2</code></pre>')
      // Inline kod
      .replace(/`([^`\n]+)`/g, '<code class="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono text-red-600">$1</code>')
      // Kalın
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      // İtalik
      .replace(/\*([^*\n]+)\*/g, '<em class="italic">$1</em>')
      // Üstü çizili
      .replace(/~~(.*?)~~/g, '<del class="line-through">$1</del>')
      // Satır sonları
      .replace(/\n/g, '<br>');
    
    return html;
  };

  if (!ReactMarkdownComponent || !remarkGfmPlugin) {
    // Fallback: Basit markdown parser kullan
    return (
      <div 
        className="text-sm leading-relaxed break-words"
        dangerouslySetInnerHTML={{ __html: parseMarkdownSimple(children) }}
      />
    );
  }

  return (
    <div className="text-sm leading-relaxed break-words prose prose-sm max-w-none">
      <ReactMarkdownComponent
        remarkPlugins={[remarkGfmPlugin]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            if (!inline && match) {
              return (
                <pre className="bg-gray-800 text-green-400 p-2 rounded text-xs overflow-x-auto my-1">
                  <div className="text-xs text-gray-400 mb-1">{match[1]}</div>
                  <code>{String(children).replace(/\n$/, "")}</code>
                </pre>
              );
            }
            return (
              <code 
                className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono text-red-600" 
                {...props}
              >
                {children}
              </code>
            );
          },
          p({ children }: any) {
            return <p className="my-0.5">{children}</p>;
          },
          strong({ children }: any) {
            return <strong className="font-bold">{children}</strong>;
          },
          em({ children }: any) {
            return <em className="italic">{children}</em>;
          },
          del({ children }: any) {
            return <del className="line-through">{children}</del>;
          },
          pre({ children }: any) {
            return <pre className="my-1">{children}</pre>;
          }
        }}
      >
        {children}
      </ReactMarkdownComponent>
    </div>
  );
};

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
    id: string;
    name: string;
    email: string;
  };
  receiver: {
    id: string;
    name: string;
    email: string;
  };
}

interface User {
  id: string;
  name: string;
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
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Şifreleme anahtarını oluştur - useMemo ile optimize et
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
        userId: string;
        name: string;
        isTyping: boolean;
      }) => {
        // Gelen yazıyor bilgisi seçili kullanıcıdan geliyorsa göster
        if (data.userId === selectedUser.id) {
          setIsTyping(data.isTyping);
          if (data.isTyping) {
            setTypingUser(data.name);
          } else {
            setTypingUser("");
          }
        }
      };
      const handleMessagesRead = (data: { receiverId: string }) => {
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
        userId: string;
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
    setMessageText("");
    setIsPreviewMode(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Shift+Enter: Yeni satır ekle
        return; // Varsayılan davranışa izin ver
      } else {
        // Sadece Enter: Mesaj gönder
        e.preventDefault();
        if (messageText.trim()) {
          const formEvent = {
            preventDefault: () => {},
            currentTarget: e.currentTarget.form
          } as FormEvent<HTMLFormElement>;
          sendMessage(formEvent);
        }
      }
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [messageText]);
  const handleTypingStart = () => {
    socket.emit("typing", {
      receiverId: selectedUser.id,
      senderId: currentUser.id,
      senderUsername: currentUser.name,
      senderName: currentUser.name,
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
      senderUsername: currentUser.name,
      senderName: currentUser.name,
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
    <div className="flex-1 max-h-screen overflow-y-auto flex flex-col bg-white">
      {" "}
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              {" "}
              <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white font-semibold">
                {selectedUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {selectedUser.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>{" "}
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">{selectedUser.name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {selectedUser.isOnline ? (
                <>
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
              </h3>{" "}
              <p className="text-gray-500 text-sm">
                {selectedUser.name} ile olan mesajların uçtan uca şifrelenir
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
                    className={`flex items-start gap-2 ${
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
                        {" "}
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-semibold">
                            {message.sender.name.charAt(0).toUpperCase()}
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
                          <span className="text-xs flex flex-col gap-1 font-medium text-gray-500">
                            {message.sender.name}{" "}
                            <Badge variant={"outline"} className="text-xs">
                              <span className="text-gray-400">
                                {message.sender.email}
                              </span>
                            </Badge>
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
                            <Suspense fallback={<div>...</div>}>
                              <MarkdownRenderer>{message.text}</MarkdownRenderer>
                            </Suspense>

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
        <form onSubmit={sendMessage} className="space-y-3">
          <div className="border rounded-lg p-3 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`p-1 rounded transition-colors ${
                  isPreviewMode ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {isPreviewMode ? <Type size={14} /> : <Eye size={14} />}
              </button>
              <span className="text-xs text-gray-500">
                {isPreviewMode ? "Düzenleme" : "Önizleme"}
              </span>
              <div className="flex-1" />
              <span className="text-xs text-gray-400">Markdown destekli</span>
            </div>
            
            {isPreviewMode ? (
              <div className="min-h-[40px] p-2 border rounded bg-gray-50">
                {messageText ? (
                  <Suspense fallback={<div>Loading preview...</div>}>
                    <MarkdownRenderer>{messageText}</MarkdownRenderer>
                  </Suspense>
                ) : (
                  <span className="text-gray-400 text-sm">Önizleme için mesaj yazın...</span>
                )}
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`${selectedUser.name}'e mesaj yaz... (Markdown desteklenir)`}
                className="w-full resize-none border-0 outline-none min-h-[40px] max-h-[120px] text-sm"
                rows={1}
                onInput={handleTypingStart}
                onBlur={handleTypingStop}
              />
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
            </div>
            <Button
              type="submit"
              disabled={!messageText.trim()}
              className="h-8 px-4 bg-green-500 hover:bg-green-600 text-white shadow transition-all duration-200"
            >
              <Send className="h-4 w-4 mr-1" />
              Gönder
            </Button>
          </div>
        </form>

        {/* Encryption Notice */}
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
          <Shield className="h-3 w-3" />
          <span>Uçtan uca şifrelenmiş mesajlar</span>
        </div>
      </div>
    </div>
  );
}
