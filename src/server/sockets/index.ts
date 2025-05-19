import prisma from '@/lib/prisma';
import { Server, Socket } from 'socket.io';

const socketHandler = (socket: Socket, io: Server): void => {
  console.log('A user connected:', socket.id);

  socket.on("sendMessage", async (data) => {
    console.log("Mesaj veritabanına kaydediliyor");
    
    await prisma.message.create({
        data: {
            text: data.text,
            sender: { connect: { username: data.sender.username } }
        }
    });
    // Tüm kullanıcılara mesajı ilet
    io.emit("sendMessage", data);
});

  socket.on("join_room", ({ room, username }) => {
      socket.join(room);
      // Odaya katılan kullanıcıyı diğerlerine bildir
      socket.to(room).emit("user_joined", `${username} sohbete katıldı.`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
};

export default socketHandler;