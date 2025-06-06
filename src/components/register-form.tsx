"use client";

import { register } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";
export default function RegisterForm() {
  const [state, action, isPending] = useActionState(register, undefined);
  return (
    <div className="max-w-xl mx-auto">
      {state?.error && (
        <div className="bg-red-500 my-3 rounded-md py-2 px-3 text-white">
          {state?.error}
        </div>
      )}
      <form action={action}>
        <Input
          disabled={isPending}
          type="text"
          name="username"
          placeholder="kullanıcı adı"
        />{" "}
        <br />
        <Input
          disabled={isPending}
          type="email"
          name="email"
          placeholder="e-posta adresi"
        />{" "}
        <br />
        <Input
          disabled={isPending}
          type="password"
          name="password"
          placeholder="Şifre"
        />{" "}
        <br />
        <Button disabled={isPending}>Kayıt Ol</Button>
      </form>
    </div>
  );
}
