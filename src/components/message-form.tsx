"use client"

import React, { useState } from "react"
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function MessageForm({ onSend }: { onSend: (message: string) => void }) {
    const [message, setMessage] = useState<string>("")
    const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(message.trim() === ""){
            alert("Mesaj boş olamaz!");
            return;
        }else{
            onSend(message);
            setMessage("")
        }
    }
    return(
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-4 bg-white border-t-2 border-gray-200">
            <Input onChange={(e) => setMessage(e.target.value)} value={message} type="text" className="flex-1 px-4 border-2 rounded-lg focus:outline-none" placeholder="Mesaj gir..." />
            <Button type="submit" variant={"outline"}>Gönder</Button>
        </form>
    )
}