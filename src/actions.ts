"use server";

import { SessionData } from "@/lib/session";
import { defaultSession, sessionOptions } from "@/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "./lib/prisma";

export async function getSession() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }

  return session;
}

export async function login(prevState: any, formData: FormData) {
  const session = await getSession();

  const formIdentify = formData.get("identify") as string;
  const formPassword = formData.get("password") as string;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: formIdentify }, { email: formIdentify }],
    },
  });

  if (!user) {
    return { error: "Kullanıcı bulunamadı!" };
  }

  // You can pass any information you want
  session.isLoggedIn = true;
  session.userId = user.id;
  session.username = user.username;
  session.email = user.email;

  await session.save();
  redirect("/");
}

export async function register(prevState: any, formData: FormData) {
  const session = await getSession();

  const formUsername = formData.get("username") as string;
  const formEmail = formData.get("email") as string;
  const formPassword = formData.get("password") as string;

  // Check if the username or email already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username: formUsername }, { email: formEmail }],
    },
  });

  if (existingUser) {
    return { error: "Kullanıcı adı veya e-posta zaten kullanılıyor!" };
  }

  // Create the new user
  const newUser = await prisma.user.create({
    data: {
      username: formUsername,
      email: formEmail,
      password: formPassword, // Hash this in a real application
    },
  });

  // Set session data
  session.isLoggedIn = true;
  session.userId = newUser.id;
  session.username = newUser.username;
  session.email = newUser.email;

  await session.save();
  redirect("/");
}
