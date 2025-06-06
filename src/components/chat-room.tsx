"use client";

import { socket } from "@/lib/socket-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { FormEvent, useEffect, useState } from "react";

interface Message {
  sender: {
    id?: string | null;
    name: string;
    email?: string | null;
  };
  text: string;
}

export default function LiveChat({ username }: { username: string }) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // İlk mesajları çek
    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => setMessages(data.data));
    // Socket dinle
    socket.on("sendMessage", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => {
      socket.off("sendMessage");
    };
  }, []);

  const sendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const message = formData.get("message") as string;
    socket.emit("sendMessage", {
      sender: {
        username: username,
      },
      text: message,
    });
    form.reset();
  };

  return (
    <>
      <div className="px-20 py-5">
        <h1 className="text-2xl font-bold text-center mb-5">
          Live Chat With Prisma DB
        </h1>
        <div className="space-y-10 mb-5">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-2 rounded-md ${
                message.sender.name === username
                  ? "bg-blue-100 text-right"
                  : "bg-gray-100 text-left"
              }`}
            >
              <div className="text-xs font-semibold text-gray-500 mb-1">
                {message.sender.name}
              </div>
              {message.text}
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="flex space-x-2">
          <Input type="text" name="message" />
          <Button>Send</Button>
        </form>
      </div>
    </>
  );
}
