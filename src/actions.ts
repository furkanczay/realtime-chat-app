"use server"

import { SessionData } from "@/lib/session";
import { defaultSession, sessionOptions } from "@/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "./lib/prisma";

export async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }

  return session;
}

export async function login(
    prevState: any,
    formData: FormData
) {
  const session = await getSession();

  const formIdentify = formData.get("identify") as string;
  const formPassword = formData.get("password") as string;

  const user = await prisma.user.findFirst({
    where: {
        OR: [
            { username: formIdentify },
            { email: formIdentify }
        ]
    }
  })

  if(!user){
    return { error: "Kullanıcı bulunamadı!" }
  }



  // You can pass any information you want
  session.isLoggedIn = true;
  session.userId = user.id;
  session.username = user.username;

  await session.save();
  redirect("/")
}