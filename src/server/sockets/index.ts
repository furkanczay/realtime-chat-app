import prisma from "@/lib/prisma";
import { Server, Socket } from "socket.io";

// Kullanıcı socket ID'lerini tutmak için
const userSockets = new Map<string, string>();

// Kullanıcının çevrimiçi durumunu arkadaşlarına bildir
const broadcastUserStatus = async (
  userId: string,
  isOnline: boolean,
  io: Server
) => {
  try {
    // Kullanıcının arkadaşlarını bul
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: { id: true } },
        user2: { select: { id: true } },
      },
    });

    // Arkadaşların ID'lerini al
    const friendIds = friendships.map((friendship) =>
      friendship.user1Id === userId ? friendship.user2Id : friendship.user1Id
    );

    // Her arkadaşa durum değişikliğini bildir
    friendIds.forEach((friendId) => {
      io.to(`user_${friendId}`).emit("userStatusChange", {
        userId,
        isOnline,
        lastSeen: new Date(),
      });
    });
  } catch (error) {
    console.error("Error broadcasting user status:", error);
  }
};

const socketHandler = (socket: Socket, io: Server): void => {
  console.log("A user connected:", socket.id);

  // Kullanıcı odasına katıl ve çevrimiçi durumunu güncelle
  socket.on("join_user", async ({ userId }) => {
    try {
      socket.join(`user_${userId}`);

      // Kullanıcıyı çevrimiçi olarak işaretle
      await prisma.user.update({
        where: { id: userId },
        data: {
          isOnline: true,
          lastSeen: new Date(),
        },
      });

      // Socket ID'yi kaydet
      userSockets.set(userId, socket.id);

      console.log(`User ${userId} joined their room and is now online`);

      // Arkadaşlarına çevrimiçi durumu bildir
      await broadcastUserStatus(userId, true, io);
    } catch (error) {
      console.error("Error updating user online status:", error);
    }
  });
  // Özel mesaj gönder
  socket.on("privateMessage", async (data) => {
    try {
      console.log("Özel mesaj veritabanına kaydediliyor");
      // Mesajı veritabanına kaydet
      const message = await prisma.message.create({
        data: {
          text: data.text,
          senderId: data.sender.id,
          receiverId: data.receiverId,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Mesajı hem gönderene hem alıcıya ilet
      io.to(`user_${data.sender.id}`).emit("privateMessage", message);
      io.to(`user_${data.receiverId}`).emit("privateMessage", message);

      // Alıcıya mesaj bildirimi gönder (sadece kendisi değilse)
      if (data.sender.id !== data.receiverId) {
        io.to(`user_${data.receiverId}`).emit("messageNotification", {
          type: "message",
          title: "Yeni Mesaj",
          message: `${data.sender.username}: ${data.text.substring(0, 50)}${
            data.text.length > 50 ? "..." : ""
          }`,
          username: data.sender.username,
          name: data.sender.name,
          data: {
            senderId: data.sender.id,
            messageId: message.id,
          },
        });
      }
    } catch (error) {
      console.error("Mesaj kaydetme hatası:", error);
      socket.emit("messageError", { error: "Mesaj gönderilemedi" });
    }
  });

  // Arkadaş isteği bildirimi
  socket.on("friendRequestSent", (data) => {
    // Alıcıya arkadaş isteği bildirimi gönder
    io.to(`user_${data.receiverId}`).emit("friendRequestNotification", {
      type: "friend_request",
      title: "Yeni Arkadaş İsteği",
      message: `${data.senderUsername} size arkadaş isteği gönderdi`,
      username: data.senderUsername,
      name: data.senderName,
      data: {
        requestId: data.requestId,
        senderId: data.senderId,
      },
    });
  });

  // Arkadaş isteği kabul edildi bildirimi
  socket.on("friendRequestAccepted", (data) => {
    // Gönderene kabul bildirimi gönder
    io.to(`user_${data.senderId}`).emit("friendAcceptedNotification", {
      type: "friend_accepted",
      title: "Arkadaş İsteği Kabul Edildi",
      message: `${data.accepterUsername} arkadaş isteğinizi kabul etti`,
      username: data.accepterUsername,
      name: data.accepterName,
      data: {
        userId: data.accepterId,
      },
    });
  }); // Yazıyor durumu
  socket.on("typing", (data) => {
    // Alıcıya yazıyor durumunu ilet
    socket.to(`user_${data.receiverId}`).emit("userTyping", {
      userId: data.senderId,
      username: data.senderUsername,
      name: data.senderName,
      isTyping: data.isTyping,
    });
  }); // Mesaj okundu bildirimi
  socket.on("messagesRead", (data) => {
    console.log("Server: Okundu bildirimi alındı:", data);
    // Gönderene mesajların okunduğunu bildir
    socket.to(`user_${data.senderId}`).emit("messagesMarkedAsRead", {
      receiverId: data.receiverId,
    });
    console.log(
      `Server: Okundu bildirimi user_${data.senderId} odasına gönderildi`
    );
  });

  // Eski genel chat için (geriye uyumluluk)
  socket.on("sendMessage", async () => {
    console.log("Genel mesaj (deprecated)");
    // Bu artık kullanılmıyor ama mevcut kod için bırakıldı
  });

  socket.on("join_room", ({ room, username }) => {
    socket.join(room);
    socket.to(room).emit("user_joined", `${username} sohbete katıldı.`);
  });
  socket.on("disconnect", async () => {
    console.log("A user disconnected:", socket.id);

    // Hangi kullanıcının bağlantısının kesildiğini bul
    let disconnectedUserId: string | null = null;
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }

    if (disconnectedUserId) {
      try {
        // Kullanıcıyı çevrimdışı olarak işaretle
        await prisma.user.update({
          where: { id: disconnectedUserId },
          data: {
            isOnline: false,
            lastSeen: new Date(),
          },
        });

        // Socket ID'yi kaldır
        userSockets.delete(disconnectedUserId);

        console.log(`User ${disconnectedUserId} is now offline`);

        // Arkadaşlarına çevrimdışı durumu bildir
        await broadcastUserStatus(disconnectedUserId, false, io);
      } catch (error) {
        console.error("Error updating user offline status:", error);
      }
    }
  });
};

export default socketHandler;
