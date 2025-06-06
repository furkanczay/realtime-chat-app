"use client";
import { cn } from "@/lib/utils";

export default function SingleMessage({
  message,
  username = "Kullanıcı Adı",
  isMe,
}: {
  message: string;
  username?: string;
  isMe: boolean;
}) {
  if (username === "Sistem") {
    return (
      <div className="flex justify-center w-full my-2">
        <span className="text-xs text-muted-foreground italic">{message}</span>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex items-start gap-3 px-2 py-1 group",
        isMe ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-lg shadow-sm",
          isMe ? "bg-blue-500" : ""
        )}
      >
        {username.charAt(0).toLocaleUpperCase()}
      </div>
      <div className={cn("flex flex-col max-w-[70%]")}>
        <span className="text-xs font-semibold text-primary">{username}</span>
        <div
          className={cn(
            "rounded-xl bg-muted px-4 py-2 mt-1 shadow group-hover:shadow-md transition",
            isMe ? "bg-blue-500" : ""
          )}
        >
          <span
            className={cn("text-sm text-foreground", isMe ? "text-white" : "")}
          >
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}
