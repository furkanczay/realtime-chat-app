import ChatRoom from "@/components/chat-room";

export default function Home() {
  return (
    <div>
      <h1>Hello World</h1>
      <ChatRoom roomName="Genel" messages={[{
        text: "Hello World",
        senderId: 1
      }]} />
    </div>
  );
}
