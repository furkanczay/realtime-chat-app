"use client";

import { useState, useCallback } from "react";
import { type Notification } from "@/components/notification-toast";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).substring(7),
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Browser bildirimini göster (izin varsa)
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
          tag: newNotification.id,
        });
      }

      // Ses çal (opsiyonel)
      try {
        const audio = new Audio("/notification-sound.mp3");
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ses çalma başarısız olursa sessizce devam et
        });
      } catch (error) {
        // Ses dosyası yoksa sessizce devam et
      }

      // 5 saniye sonra otomatik kaldır (mesaj bildirimleri hariç)
      if (notification.type !== "message") {
        setTimeout(() => {
          removeNotification(newNotification.id);
        }, 5000);
      }

      return newNotification.id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const requestPermission = useCallback(async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll,
    requestPermission,
    unreadCount: notifications.filter((n) => !n.read).length,
  };
}
