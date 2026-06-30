"use client";
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { RealtimeChannel } from "@supabase/supabase-js";

type Notification = {
  id: string;
  type: "message" | "order";
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "is_read" | "created_at">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      setupSubscription();
    }

    // Cleanup - komponent unmount bo'lganda subscriptionni tozalash
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user]);

  const fetchNotifications = () => {
    if (!user) return;

    // localStorage'dan o'qish
    const saved = localStorage.getItem(`notifications_${user.id}`);
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch {
        setNotifications([]);
      }
    }
  };

  const saveNotifications = (notifs: Notification[]) => {
    if (user) {
      try {
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifs));
      } catch (err) {
        console.error("localStorage xatosi:", err);
      }
    }
  };

  const setupSubscription = () => {
    if (!user) return;

    // Avvalgi subscriptionni o'chirish (agar mavjud bo'lsa)
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Unikal channel nomi (har bir foydalanuvchi uchun)
    const channelName = `notifications-${user.id}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "messages" 
        },
        async (payload) => {
          const newMsg = payload.new as any;
          
          // Agar bu xabar bizga kelgan bo'lsa (lekin biz yubormagan bo'lsak)
          if (newMsg.user_id === user.id && newMsg.sender_id !== user.id) {
            // Mahsulot nomini olish
            const { data: product } = await supabase
              .from("products")
              .select("name")
              .eq("id", newMsg.product_id)
              .single();

            addNotification({
              type: "message",
              title: "💬 Yangi xabar",
              message: `${product?.name || "Mahsulot"} bo'yicha yangi xabar keldi`,
              link: `/chat/${newMsg.product_id}`
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  };

  const addNotification = (notification: Omit<Notification, "id" | "is_read" | "created_at">) => {
    const newNotif: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      is_read: false,
      created_at: new Date().toISOString()
    };

    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      saveNotifications(updated);
      return updated;
    });

    // Browser notification ko'rsatish
    showPopup(newNotif);
  };

  const showPopup = (notif: Notification) => {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(notif.title, {
          body: notif.message,
          icon: "/favicon.ico"
        });
      } catch (err) {
        console.error("Notification xatosi:", err);
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, is_read: true } : n));
      saveNotifications(updated);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, is_read: true }));
      saveNotifications(updated);
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}