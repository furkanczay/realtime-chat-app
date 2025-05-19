"use server"

import { SessionData } from "@/lib/session";
import { defaultSession, sessionOptions } from "@/lib/session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }

  return session;
}

export async function login(
  formData: FormData
) {
  const session = await getSession();

  const formUsername = formData.get("username") as string;
  const formPassword = formData.get("password") as string;

  const user = {
    id:"dasfsdgds",
    username:formUsername,
    img:"avatar.png"
  }

  // IF CREDENTIALS ARE WRONG RETURN AN ERROR
  if(!user){
    return { error: "Wrong Credentials!" }
  }

  // You can pass any information you want
  session.isLoggedIn = true;
  session.userId = user.id;
  session.username = user.username;

  await session.save();
  redirect("/")
}