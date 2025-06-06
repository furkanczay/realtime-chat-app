"use client";

import { X, Check, UserPlus, MessageCircle, Bell } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";

export interface Notification {
  id: string;
  type: "friend_request" | "friend_accepted" | "message" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: Record<string, unknown>;
  username?: string;
  avatar?: string;
}

interface NotificationToastProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}

export default function NotificationToast({
  notifications,
  onRemove,
  onMarkAsRead,
}: NotificationToastProps) {
  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "friend_request":
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case "friend_accepted":
        return <Check className="h-5 w-5 text-green-500" />;
      case "message":
        return <MessageCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = (type: Notification["type"]) => {
    switch (type) {
      case "friend_request":
        return "bg-blue-50 border-blue-200";
      case "friend_accepted":
        return "bg-green-50 border-green-200";
      case "message":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(0, 5).map((notification) => (
        <Card
          key={notification.id}
          className={`${getBackgroundColor(
            notification.type
          )} animate-in slide-in-from-right-full duration-300 shadow-lg`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Avatar veya Icon */}
              <div className="flex-shrink-0">
                {notification.username ? (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-600 text-white text-sm">
                      {notification.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="p-1">{getIcon(notification.type)}</div>
                )}
              </div>

              {/* İçerik */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.timestamp).toLocaleTimeString(
                        "tr-TR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>

                  {/* Kapatma butonu */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    onClick={() => onRemove(notification.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Okunmadı işareti */}
                {!notification.read && (
                  <div
                    className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full cursor-pointer"
                    onClick={() => onMarkAsRead(notification.id)}
                    title="Okundu olarak işaretle"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Çok fazla bildirim varsa sayıyı göster */}
      {notifications.length > 5 && (
        <Card className="bg-gray-100 border-gray-300">
          <CardContent className="p-2 text-center">
            <p className="text-xs text-gray-600">
              +{notifications.length - 5} daha fazla bildirim
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
