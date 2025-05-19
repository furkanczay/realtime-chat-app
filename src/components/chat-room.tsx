"use client";

import MessageForm from "./message-form";
import SingleMessage from "./single-message";

export default function ChatRoom({ roomName, messages }: { roomName: string, messages: string[] }) {
    const handleSendMessage = (message: string) => {
        console.log("Mesaj gönderildi:", message);
    }
    return(
        <div className="flex mt-24 justify-center w-full">
            <div className="w-full max-w-4xl mx-auto rounded-2xl shadow-lg bg-card border border-border flex flex-col h-[70vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-2xl">
                    <h1 className="text-2xl font-extrabold tracking-tight text-primary">{roomName}</h1>
                    <span className="text-xs text-muted-foreground font-mono">Çevrimiçi: 3</span>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-background">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">Henüz mesaj yok.</div>
                    ) : (
                        messages.map((msg, i) => <SingleMessage key={i} message={msg} />)
                    )}
                </div>
                <div className="border-t border-border bg-card rounded-b-2xl">
                    <MessageForm onSend={handleSendMessage} />
                </div>
            </div>
        </div>
    )
}