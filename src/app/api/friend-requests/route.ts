import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Arkadaşlık isteklerini getir
export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "UNAUTHORIZED",
      },
      { status: 403 }
    );
  }

  try {
    // Kullanıcıya gelen bekleyen istekleri getir
    const friendRequests = await prisma.friendRequest.findMany({
      where: {
        receiverId: session.user.id,
        status: "PENDING",
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: friendRequests,
    });
  } catch (error) {
    console.error("Arkadaşlık istekleri getirilirken hata:", error);
    return NextResponse.json(
      {
        success: false,
        message: "İstekler getirilemedi",
      },
      { status: 500 }
    );
  }
}

// Arkadaşlık isteği gönder
export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "UNAUTHORIZED",
      },
      { status: 403 }
    );
  }

  try {
    const { receiverId } = await request.json();

    if (!receiverId || receiverId === session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Geçersiz alıcı",
        },
        { status: 400 }
      );
    }

    // Alıcının var olup olmadığını kontrol et
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json(
        {
          success: false,
          message: "Kullanıcı bulunamadı",
        },
        { status: 404 }
      );
    } // Zaten arkadaş mı kontrol et
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: session.user.id, user2Id: receiverId },
          { user1Id: receiverId, user2Id: session.user.id },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json(
        {
          success: false,
          message: "Zaten arkadaşsınız",
        },
        { status: 400 }
      );
    }

    // Bekleyen istek var mı kontrol et
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: receiverId },
          { senderId: receiverId, receiverId: session.user.id },
        ],
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "Zaten bekleyen bir istek var",
        },
        { status: 400 }
      );
    }

    // Arkadaşlık isteği oluştur
    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId: session.user.id,
        receiverId: receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: friendRequest,
    });
  } catch (error) {
    console.error("Arkadaşlık isteği gönderilirken hata:", error);
    return NextResponse.json(
      {
        success: false,
        message: "İstek gönderilemedi",
      },
      { status: 500 }
    );
  }
}
