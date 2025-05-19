"use client";

import { login } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";
export default function LoginForm(){
    const [state, action, isPending] = useActionState(login, undefined);
    return(
        <div className="max-w-xl mx-auto">
            {state?.error && (
                <div className="bg-red-500 my-3 rounded-md py-2 px-3 text-white">
                    {state?.error}
                </div>
            )}
            <form action={action}>
                <Input disabled={isPending} type="text" name="identify" placeholder="Kullanıcı adı veya e-posta adresi" /> <br />
                <Input disabled={isPending} type="password" name="password" placeholder="Şifre" /> <br />
                <Button disabled={isPending}>Giriş Yap</Button>
            </form>
        </div>
    )
}