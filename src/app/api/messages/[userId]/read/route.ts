// Mesajları okundu olarak işaretle
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getIronSession<SessionData>(
      request,
      new Response(),
      sessionOptions
    );

    if (!session.userId) {
      return NextResponse.json(
        { success: false, message: "Giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const otherUserId = parseInt(params.userId);

    if (isNaN(otherUserId)) {
      return NextResponse.json(
        { success: false, message: "Geçersiz kullanıcı ID" },
        { status: 400 }
      );
    }

    // Bu kullanıcıdan gelen tüm okunmamış mesajları okundu olarak işaretle
    const updatedMessages = await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: session.userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mesajlar okundu olarak işaretlendi",
      updatedCount: updatedMessages.count,
    });
  } catch (error) {
    console.error("Mesajları okundu işaretleme hatası:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
