import { getSession } from "@/actions"
import { Button } from "./ui/button";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Header(){
    const session = await getSession();
    const logout = async () => {
        "use server"
        const cookieList = await cookies();
        cookieList.delete("realtime-chat-session")
        return redirect("/login");
    }
    return(
        <header>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">CzayChat</h1>
                </div>
                <div className="inline-flex items-center gap-2">
                    {session.isLoggedIn && (
                        <>
                            <span>{session.username}</span>
                            <form action={logout}>
                                <Button type="submit" variant={"destructive"}>Çıkış Yap</Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}