import { getSession } from "@/actions";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({
            success: false,
            message: "UNAUTHORIZED"
        }, { status: 403 });
    }

    // Mesajları çek, gönderen kullanıcıyı da dahil et
    const messages = await prisma.message.findMany({
        orderBy: { createdAt: "asc" },
        include: { sender: true }
    });

    return NextResponse.json({
        success: true,
        data: messages
    });
}