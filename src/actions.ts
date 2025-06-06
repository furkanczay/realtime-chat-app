"use server";
import { redirect } from "next/navigation";
import prisma from "./lib/prisma";
import { auth } from "./lib/auth";
import { APIError } from "better-auth";

export async function login(prevState: any, formData: FormData) {
  const formEmail = formData.get("email") as string;
  const formPassword = formData.get("password") as string;

  try {
    await auth.api.signInEmail({
      body: {
        email: formEmail,
        password: formPassword,
      },
    });
  } catch (error) {
    return {
      error:
        (error as APIError).message ||
        "Giriş başarısız oldu. Lütfen tekrar deneyin.",
    };
  }
  redirect("/");
}

export async function register(prevState: any, formData: FormData) {
  const formUsername = formData.get("username") as string;
  const formEmail = formData.get("email") as string;
  const formPassword = formData.get("password") as string;
  const formName = formData.get("name") as string;

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
  try {
    await auth.api.signUpEmail({
      body: {
        username: formUsername,
        email: formEmail,
        password: formPassword,
        name: formName,
      },
    });
  } catch (error) {
    return {
      error:
        (error as APIError).message ||
        "Kayıt başarısız oldu. Lütfen tekrar deneyin.",
    };
  }
  redirect("/");
}
