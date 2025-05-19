export default function SingleMessage({ message, username = "Kullanıcı Adı" }: { message: {
    text: string,
    senderId: number
}, username?: string }) {
    return (
        <div className="flex items-start gap-3 px-2 py-1 group">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-lg shadow-sm">
                {username[0]}
            </div>
            <div className="flex flex-col max-w-[70%]">
                <span className="text-xs font-semibold text-primary">{username}</span>
                <div className="rounded-xl bg-muted px-4 py-2 mt-1 shadow group-hover:shadow-md transition">
                    <span className="text-sm text-foreground">{message.text}</span>
                </div>
            </div>
        </div>
    )
}