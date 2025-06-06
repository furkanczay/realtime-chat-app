import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
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
    const { name, email, avatar } = await request.json();

    // Boş alan kontrolü
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "İsim ve e-posta alanları zorunludur",
        },
        { status: 400 }
      );
    }

    // E-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Geçerli bir e-posta adresi girin",
        },
        { status: 400 }
      );
    }

    // E-posta başka bir kullanıcı tarafından kullanılıyor mu kontrol et
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message: "Bu e-posta adresi zaten kullanılıyor",
          },
          { status: 400 }
        );
      }
    }

    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        email: email.trim(),
        image: avatar?.trim() || null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastSeen: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil başarıyla güncellendi",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Profil güncellenirken hata:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Profil güncellenemedi",
      },
      { status: 500 }
    );
  }
}
